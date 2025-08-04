'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Users,
  X,
  AlertCircle,
  Check,
} from 'lucide-react';

interface Area {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  _count: {
    customers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AreaFormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface AreaManagementProps {
  onAreaSelect?: (areaId: string) => void;
  selectedAreaId?: string;
}

export default function AreaManagement({
  onAreaSelect,
  selectedAreaId,
}: AreaManagementProps) {
  const { toast } = useToast();
  const { t } = useSettings();

  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const [formData, setFormData] = useState<AreaFormData>({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/areas');

      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      } else {
        toast({
          title: t('error'),
          description: t('failedToFetchAreas'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast({
        title: t('error'),
        description: t('failedToFetchAreas'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        code: area.code || '',
        description: area.description || '',
        isActive: area.isActive,
      });
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArea(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: t('error'),
        description: t('areaNameRequired'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const url = editingArea
        ? `/api/areas?id=${editingArea.id}`
        : '/api/areas';

      const method = editingArea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: editingArea
            ? t('areaUpdatedSuccessfully')
            : t('areaCreatedSuccessfully'),
        });

        await fetchAreas();
        closeModal();
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || t('failedToSaveArea'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving area:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveArea'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (area: Area) => {
    if (area._count.customers > 0) {
      toast({
        title: t('error'),
        description: t('cannotDeleteAreaWithCustomers'),
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`${t('confirmDeleteArea')} "${area.name}"?`)) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/areas?id=${area.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: t('success'),
          description: t('areaDeletedSuccessfully'),
        });

        await fetchAreas();
      } else {
        const errorData = await response.json();
        toast({
          title: t('error'),
          description: errorData.error || t('failedToDeleteArea'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting area:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteArea'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('areaManagement')}</h3>
          <div className="h-10 w-24 animate-pulse rounded-md bg-gray-300 dark:bg-gray-600"></div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 shadow">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              <div className="mt-2 h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              <div className="mt-4 flex justify-end space-x-2">
                <div className="h-8 w-8 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                <div className="h-8 w-8 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">
            {t('areaManagement')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t('organizeCustomersByGeographicalAreas')}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Plus className="mr-1 h-4 w-4" />
          {t('addArea')}
        </button>
      </div>

      {/* Areas Grid */}
      {areas.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-foreground mb-2 text-lg font-medium">
            {t('noAreasFound')}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('createYourFirstAreaToOrganizeCustomers')}
          </p>
          <button
            onClick={() => openModal()}
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('createFirstArea')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas &&
            areas.map((area) => (
              <div
                key={area.id}
                className={`bg-card rounded-lg border p-4 shadow transition-all hover:shadow-md ${
                  selectedAreaId === area.id
                    ? 'border-blue-200 ring-2 ring-blue-500 dark:border-blue-800'
                    : ''
                } ${onAreaSelect ? 'cursor-pointer' : ''}`}
                onClick={() => onAreaSelect?.(area.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-foreground font-medium">
                        {area.name}
                      </h4>
                      {selectedAreaId === area.id && (
                        <Check className="ml-2 h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    {area.code && (
                      <p className="text-muted-foreground text-sm">
                        Code: {area.code}
                      </p>
                    )}
                    {area.description && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {area.description}
                      </p>
                    )}
                    <div className="text-muted-foreground mt-2 flex items-center text-sm">
                      <Users className="mr-1 h-4 w-4" />
                      {area._count.customers} customer
                      {area._count.customers !== 1 ? 's' : ''}
                    </div>
                    <div className="mt-1 flex items-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          area.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
                        }`}
                      >
                        {area.isActive ? t('active') : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {!onAreaSelect && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openModal(area)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        title={t('editAreaTooltip')}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                        title={t('deleteAreaTooltip')}
                        disabled={area._count.customers > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-card w-full max-w-md rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground text-lg font-semibold">
                {editingArea ? t('editArea') : t('addNewArea')}
              </h3>
              <button
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('areaName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('areaNamePlaceholder')}
                />
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('areaCode')}
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('areaCodePlaceholder')}
                  maxLength={10}
                />
              </div>

              <div>
                <label className="text-foreground mb-2 block text-sm font-medium">
                  {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="border-border bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2"
                  placeholder={t('optionalDescriptionForArea')}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-foreground text-sm">
                  {t('activeArea')}
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="border-border text-muted-foreground hover:bg-muted/50 rounded-lg border px-4 py-2"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={submitting || !formData.name.trim()}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                )}
                {editingArea ? t('edit') : t('add')} Area
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
