import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Edit2, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import { useDatabase } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { ManualGPSData } from '@/types/gps';
import { cn } from '@/lib/utils';

interface ManualGPSFormData {
  name: string;
  latitude: string;
  longitude: string;
  altitude: string;
  address: string;
  description: string;
  tags: string;
}

export const ManualGPS: React.FC = () => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ManualGPSData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const {
    manualGPSData,
    loading,
    saveManualGPSData,
    updateManualGPSData,
    deleteManualGPSData,
    error
  } = useDatabase();

  const [formData, setFormData] = useState<ManualGPSFormData>({
    name: '',
    latitude: '',
    longitude: '',
    altitude: '',
    address: '',
    description: '',
    tags: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      altitude: '',
      address: '',
      description: '',
      tags: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item: ManualGPSData) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      latitude: item.coordinates.latitude.toString(),
      longitude: item.coordinates.longitude.toString(),
      altitude: item.coordinates.altitude?.toString() || '',
      address: item.address || '',
      description: item.description || '',
      tags: item.tags?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        toast({
          title: "Invalid Coordinates",
          description: "Please enter valid latitude and longitude values.",
          variant: "destructive"
        });
        return;
      }

      const gpsData = {
        name: formData.name,
        coordinates: {
          latitude: lat,
          longitude: lng,
          altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
          timestamp: new Date()
        },
        address: formData.address || undefined,
        description: formData.description || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
      };

      if (editingItem) {
        await updateManualGPSData(editingItem.id, gpsData);
        toast({
          title: "Location Updated",
          description: `${formData.name} has been updated successfully.`
        });
      } else {
        await saveManualGPSData(gpsData);
        toast({
          title: "Location Saved",
          description: `${formData.name} has been added to your GPS locations.`
        });
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save GPS location",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteManualGPSData(id);
      toast({
        title: "Location Deleted",
        description: "GPS location has been removed successfully."
      });
      setDeleteConfirm(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete GPS location",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Manual GPS Locations</h1>
              <p className="text-muted-foreground">Manage your saved GPS coordinates</p>
            </div>
          </div>
          
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Location
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* GPS Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manualGPSData.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {item.coordinates.latitude.toFixed(4)}, {item.coordinates.longitude.toFixed(4)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="w-8 h-8 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(item.id)}
                      className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {item.address && (
                  <p className="text-sm text-muted-foreground mb-2">{item.address}</p>
                )}
                
                {item.description && (
                  <p className="text-sm mb-3">{item.description}</p>
                )}
                
                {item.coordinates.altitude && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Altitude: {item.coordinates.altitude.toFixed(1)}m
                  </div>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  Updated: {item.updatedAt.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {manualGPSData.length === 0 && !loading && (
          <Card className="mt-8">
            <CardContent className="pt-6 text-center py-12">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No GPS Locations</h3>
              <p className="text-muted-foreground mb-4">
                Add your first GPS location to get started with manual GPS data.
              </p>
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add First Location
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit GPS Location' : 'Add GPS Location'}
            </DialogTitle>
            <DialogDescription>
              Enter the GPS coordinates and additional information for this location.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Office Building, Home, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="37.7749"
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="-122.4194"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="altitude">Altitude (meters)</Label>
              <Input
                id="altitude"
                type="number"
                step="any"
                value={formData.altitude}
                onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address (optional)"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes about this location..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="work, personal, landmark (comma separated)"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingItem ? 'Update' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete GPS Location</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this GPS location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};