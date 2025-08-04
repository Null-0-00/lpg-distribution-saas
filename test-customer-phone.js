// Test customer phone number formatting
const fetch = require('node-fetch');

async function testPhoneNumbers() {
  console.log('📱 Testing different phone number formats...\n');

  const phoneNumbers = [
    '+8801793536222', // Customer phone from database
    '8801793536222', // Without +
    '+8801334117987', // Connected WhatsApp number (known working)
    '8801334117987', // Without +
  ];

  for (const phone of phoneNumbers) {
    console.log(`🔍 Testing: ${phone}`);

    const testMessage = {
      number: phone,
      text: `📱 Phone format test: ${phone}

This is a test message to verify phone number format.

Time: ${new Date().toLocaleString('bn-BD')}`,
    };

    try {
      const response = await fetch(
        'http://evo-p8okkk0840kg40o0o44w4gck.173.249.28.62.sslip.io/message/sendText/lpgapp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: 'nJjnWgllihDFnx2FRk3yyIdvi5NUUFl7',
          },
          body: JSON.stringify(testMessage),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(`  ✅ SUCCESS - Message ID: ${result.key?.id}`);
      } else {
        console.log(`  ❌ FAILED - Status: ${response.status}`);
        console.log(`  📋 Error:`, result);
      }
    } catch (error) {
      console.log(`  ❌ ERROR:`, error.message);
    }

    console.log(''); // Empty line
  }
}

testPhoneNumbers();
