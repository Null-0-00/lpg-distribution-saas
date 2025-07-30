import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface OnboardingData {
  companies: Array<{ name: string }>;
  cylinderSizes: Array<{ size: string; description?: string }>;
  products: Array<{
    name: string;
    companyId: string;
    cylinderSizeId: string;
    currentPrice: number;
  }>;
  inventory: Array<{
    productId: string;
    fullCylinders: number;
  }>;
  emptyCylinders: Array<{
    cylinderSizeId: string;
    quantity: number;
  }>;
  drivers: Array<{
    name: string;
    phone?: string;
    driverType?: string;
  }>;
  receivables: Array<{
    driverId: string;
    cashReceivables: number;
    cylinderReceivables: number;
    cylinderReceivablesBySizes?: Array<{
      cylinderSizeId: string;
      size: string;
      quantity: number;
    }>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data: OnboardingData = body;
    const userId = session.user.id;
    const tenantId = session.user.tenantId;

    console.log('Onboarding data received:', JSON.stringify(data, null, 2));

    // Check if user has already completed onboarding
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.onboardingCompleted) {
      console.log('User has already completed onboarding:', userId);
      return NextResponse.json(
        { error: 'Onboarding already completed. Cannot run onboarding again.' },
        { status: 400 }
      );
    }

    console.log('User onboarding status:', {
      userId,
      onboardingCompleted: user.onboardingCompleted,
    });

    // Use transaction to ensure data consistency (with extended timeout for complex onboarding)
    await prisma.$transaction(
      async (tx) => {
        // 1. Create companies
        const createdCompanies = await Promise.all(
          data.companies.map((company) =>
            tx.company.create({
              data: {
                tenantId,
                name: company.name,
                isActive: true,
              },
            })
          )
        );

        // 2. Create cylinder sizes
        const createdCylinderSizes = await Promise.all(
          data.cylinderSizes.map((size) =>
            tx.cylinderSize.create({
              data: {
                tenantId,
                size: size.size,
                description: size.description,
                isActive: true,
              },
            })
          )
        );

        // 3. Create products
        const createdProducts = await Promise.all(
          data.products.map((product) => {
            const companyIndex = parseInt(product.companyId);
            const sizeIndex = parseInt(product.cylinderSizeId);

            return tx.product.create({
              data: {
                tenantId,
                companyId: createdCompanies[companyIndex].id,
                cylinderSizeId: createdCylinderSizes[sizeIndex].id,
                name: product.name,
                size: createdCylinderSizes[sizeIndex].size, // For backward compatibility
                currentPrice: product.currentPrice,
                isActive: true,
              },
            });
          })
        );

        // 4. Create drivers
        const createdDrivers = await Promise.all(
          data.drivers.map((driver) =>
            tx.driver.create({
              data: {
                tenantId,
                name: driver.name,
                phone: driver.phone,
                driverType:
                  (driver.driverType as 'RETAIL' | 'SHIPMENT') || 'RETAIL',
                status: 'ACTIVE',
              },
            })
          )
        );

        // 5. Create initial inventory records (shipment baseline values)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create inventory records for each product - these are the shipment baseline values
        await Promise.all(
          data.inventory.map((inventory, index) => {
            const productIndex = parseInt(inventory.productId);
            const product = createdProducts[productIndex];

            return tx.inventoryRecord.create({
              data: {
                tenantId,
                productId: product.id,
                cylinderSizeId: product.cylinderSizeId,
                date: today,
                fullCylinders: inventory.fullCylinders, // Shipment baseline for full cylinders
                emptyCylinders: 0,
                totalCylinders: inventory.fullCylinders,
                packageSales: 0,
                refillSales: 0,
                totalSales: 0,
                packagePurchase: 0, // No purchase on onboarding day - these are shipment values
                refillPurchase: 0,
                emptyCylindersBuySell: 0,
              },
            });
          })
        );

        // 6. Create empty cylinder inventory records (shipment baseline values)
        await Promise.all(
          data.emptyCylinders.map((emptyCylinder, index) => {
            const sizeIndex = parseInt(emptyCylinder.cylinderSizeId);

            // Find a product with this cylinder size to associate the empty cylinders
            const productWithSize = createdProducts.find(
              (p) => p.cylinderSizeId === createdCylinderSizes[sizeIndex].id
            );

            if (productWithSize && emptyCylinder.quantity > 0) {
              return tx.inventoryRecord.upsert({
                where: {
                  tenantId_date_productId_cylinderSizeId: {
                    tenantId,
                    date: today,
                    productId: productWithSize.id,
                    cylinderSizeId: productWithSize.cylinderSizeId,
                  },
                },
                update: {
                  emptyCylinders: emptyCylinder.quantity, // Shipment baseline for empty cylinders
                  totalCylinders: {
                    increment: emptyCylinder.quantity,
                  },
                  emptyCylindersBuySell: 0, // No buy/sell on onboarding day - these are shipment values
                },
                create: {
                  tenantId,
                  productId: productWithSize.id,
                  cylinderSizeId: productWithSize.cylinderSizeId,
                  date: today,
                  fullCylinders: 0,
                  emptyCylinders: emptyCylinder.quantity, // Shipment baseline for empty cylinders
                  totalCylinders: emptyCylinder.quantity,
                  packageSales: 0,
                  refillSales: 0,
                  totalSales: 0,
                  packagePurchase: 0,
                  refillPurchase: 0,
                  emptyCylindersBuySell: 0, // No buy/sell on onboarding day - these are shipment values
                },
              });
            }
          })
        );

        // 7. Create receivable records
        console.log('Creating receivable records:', data.receivables);
        console.log(
          'Created drivers:',
          createdDrivers.map((d) => ({ id: d.id, name: d.name }))
        );

        const receivablePromises = data.receivables
          .filter(
            (receivable) =>
              receivable.cashReceivables > 0 ||
              receivable.cylinderReceivables > 0
          )
          .map((receivable, index) => {
            const driverIndex = parseInt(receivable.driverId);
            const driver = createdDrivers[driverIndex];

            if (!driver) {
              console.error(
                `Driver not found at index ${driverIndex}. Available drivers:`,
                createdDrivers.length
              );
              throw new Error(`Driver not found at index ${driverIndex}`);
            }

            console.log(
              `Creating receivable for driverIndex: ${driverIndex}, driver: ${driver.name}, cash: ${receivable.cashReceivables}, cylinder: ${receivable.cylinderReceivables}`
            );

            return tx.receivableRecord.upsert({
              where: {
                tenantId_driverId_date: {
                  tenantId,
                  driverId: driver.id,
                  date: today,
                },
              },
              update: {
                cashReceivablesChange: 0, // Onboarding values are starting balances, not changes
                cylinderReceivablesChange: 0,
                totalCashReceivables: receivable.cashReceivables,
                totalCylinderReceivables: receivable.cylinderReceivables,
              },
              create: {
                tenantId,
                driverId: driver.id,
                date: today,
                cashReceivablesChange: 0, // Onboarding values are starting balances, not changes
                cylinderReceivablesChange: 0,
                totalCashReceivables: receivable.cashReceivables,
                totalCylinderReceivables: receivable.cylinderReceivables,
              },
            });
          });

        await Promise.all(receivablePromises);

        // 8. Create permanent cylinder size baselines for drivers (cannot be deleted)
        const driverBaselinePromises = [];
        for (const receivable of data.receivables) {
          if (
            receivable.cylinderReceivablesBySizes &&
            receivable.cylinderReceivablesBySizes.length > 0
          ) {
            const driverIndex = parseInt(receivable.driverId);
            const driver = createdDrivers[driverIndex];

            if (driver) {
              for (const sizeReceivable of receivable.cylinderReceivablesBySizes) {
                if (sizeReceivable.quantity > 0) {
                  // Find the cylinder size by temp ID or size string
                  const sizeIndex = sizeReceivable.cylinderSizeId.startsWith(
                    'temp-'
                  )
                    ? parseInt(
                        sizeReceivable.cylinderSizeId.replace('temp-', '')
                      )
                    : parseInt(sizeReceivable.cylinderSizeId);

                  const cylinderSize = createdCylinderSizes[sizeIndex];

                  if (cylinderSize) {
                    driverBaselinePromises.push(
                      tx.driverCylinderSizeBaseline.create({
                        data: {
                          tenantId,
                          driverId: driver.id,
                          cylinderSizeId: cylinderSize.id,
                          baselineQuantity: sizeReceivable.quantity,
                          source: 'ONBOARDING',
                        },
                      })
                    );
                  }
                }
              }
            }
          }
        }

        if (driverBaselinePromises.length > 0) {
          await Promise.all(driverBaselinePromises);
          console.log(
            `Created ${driverBaselinePromises.length} permanent cylinder size baseline records`
          );
        }

        // 9. Create customer receivables by size for onboarding data (optional, for backward compatibility)
        const customerReceivablePromises = [];
        for (const receivable of data.receivables) {
          if (
            receivable.cylinderReceivablesBySizes &&
            receivable.cylinderReceivablesBySizes.length > 0
          ) {
            const driverIndex = parseInt(receivable.driverId);
            const driver = createdDrivers[driverIndex];

            if (driver) {
              for (const sizeReceivable of receivable.cylinderReceivablesBySizes) {
                if (sizeReceivable.quantity > 0) {
                  customerReceivablePromises.push(
                    tx.customerReceivable.create({
                      data: {
                        tenantId,
                        driverId: driver.id,
                        customerName: 'Onboarding Balance', // Default customer name for onboarding receivables
                        receivableType: 'CYLINDER',
                        amount: 0,
                        quantity: sizeReceivable.quantity,
                        size: sizeReceivable.size,
                        status: 'CURRENT',
                        notes: 'Initial balance from onboarding',
                      },
                    })
                  );
                }
              }
            }
          }
        }

        if (customerReceivablePromises.length > 0) {
          await Promise.all(customerReceivablePromises);
          console.log(
            `Created ${customerReceivablePromises.length} customer receivable records with size breakdown`
          );
        }

        // 10. Populate inventory records with cylinder receivables from onboarding
        // Calculate total cylinder receivables by size and store in inventory records
        const receivablesBySizeMap = new Map<string, number>();

        for (const receivable of data.receivables) {
          if (
            receivable.cylinderReceivablesBySizes &&
            receivable.cylinderReceivablesBySizes.length > 0
          ) {
            for (const sizeReceivable of receivable.cylinderReceivablesBySizes) {
              if (sizeReceivable.quantity > 0) {
                const sizeIndex = sizeReceivable.cylinderSizeId.startsWith(
                  'temp-'
                )
                  ? parseInt(sizeReceivable.cylinderSizeId.replace('temp-', ''))
                  : parseInt(sizeReceivable.cylinderSizeId);

                const cylinderSize = createdCylinderSizes[sizeIndex];
                if (cylinderSize) {
                  const currentTotal =
                    receivablesBySizeMap.get(cylinderSize.size) || 0;
                  receivablesBySizeMap.set(
                    cylinderSize.size,
                    currentTotal + sizeReceivable.quantity
                  );
                }
              }
            }
          }
        }

        // Update inventory records with emptyCylinderReceivables by size
        const inventoryReceivablePromises = [];
        for (const [size, totalReceivables] of receivablesBySizeMap.entries()) {
          // Find a product with this cylinder size to associate the receivables
          const productWithSize = createdProducts.find(
            (p) =>
              p.cylinderSizeId ===
              createdCylinderSizes.find((cs) => cs.size === size)?.id
          );

          if (productWithSize && totalReceivables > 0) {
            inventoryReceivablePromises.push(
              tx.inventoryRecord.upsert({
                where: {
                  tenantId_date_productId_cylinderSizeId: {
                    tenantId,
                    date: today,
                    productId: productWithSize.id,
                    cylinderSizeId: productWithSize.cylinderSizeId,
                  },
                },
                update: {
                  emptyCylinderReceivables: totalReceivables,
                },
                create: {
                  tenantId,
                  productId: productWithSize.id,
                  cylinderSizeId: productWithSize.cylinderSizeId,
                  date: today,
                  fullCylinders: 0,
                  emptyCylinders: 0,
                  emptyCylinderReceivables: totalReceivables,
                  totalCylinders: 0,
                  packageSales: 0,
                  refillSales: 0,
                  totalSales: 0,
                  packagePurchase: 0,
                  refillPurchase: 0,
                  emptyCylindersBuySell: 0,
                },
              })
            );
          }
        }

        if (inventoryReceivablePromises.length > 0) {
          await Promise.all(inventoryReceivablePromises);
          console.log(
            `Updated ${inventoryReceivablePromises.length} inventory records with cylinder receivables from onboarding`
          );
        }

        // 11. Mark user as onboarded
        await tx.user.update({
          where: { id: userId },
          data: {
            onboardingCompleted: true,
            onboardingCompletedAt: new Date(),
          },
        });
      },
      {
        timeout: 15000, // 15 second timeout for complex onboarding transaction
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
