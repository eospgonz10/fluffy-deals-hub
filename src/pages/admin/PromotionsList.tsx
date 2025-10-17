import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { usePromotions } from '@/hooks/usePromotions';
import { useToast } from '@/hooks/use-toast';
import { DeletePromotionDialog } from '@/components/DeletePromotionDialog';
import { PromotionFilters, PromotionStatus } from '@/components/PromotionFilters';
import dogProducts from '@/assets/dog-products.jpg';
import catProducts from '@/assets/cat-products.jpg';
import heroPets from '@/assets/hero-pets.jpg';

const PromotionsList = () => {
  const { promotions, deletePromotion, permanentlyDeletePromotion, restorePromotion } = usePromotions();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<{ id: string; name: string } | null>(null);
  const [filter, setFilter] = useState<PromotionStatus>('all');

  const getPromotionImage = (imageName: string) => {
    const images: Record<string, string> = {
      'dog-products': dogProducts,
      'cat-products': catProducts,
      'hero-pets': heroPets,
    };
    return images[imageName] || dogProducts;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPromotionStatus = (promotion: { startDate: string; endDate: string; isActive: boolean }): PromotionStatus => {
    if (!promotion.isActive) return 'trash';
    
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) return 'scheduled';
    if (now > end) return 'expired';
    return 'active';
  };

  const filteredPromotions = promotions.filter(promo => {
    const status = getPromotionStatus(promo);
    
    if (filter === 'all') return promo.isActive;
    if (filter === 'trash') return !promo.isActive;
    return status === filter && promo.isActive;
  });

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedPromotion({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPromotion) {
      deletePromotion(selectedPromotion.id);
      toast({
        title: "Promoción eliminada",
        description: "La promoción se ha movido a la papelera",
      });
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
    }
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) {
      permanentlyDeletePromotion(id);
      toast({
        title: "Promoción eliminada permanentemente",
        description: "La promoción ha sido eliminada completamente",
      });
    }
  };

  const handleRestore = (id: string) => {
    restorePromotion(id);
    toast({
      title: "Promoción restaurada",
      description: "La promoción ha sido restaurada exitosamente",
    });
  };

  const isTrashView = filter === 'trash';

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Promociones</h1>
            <PromotionFilters selectedFilter={filter} onFilterChange={setFilter} />
          </div>
          
          {!isTrashView && (
            <Link to="/admin/promotions/create">
              <Button 
                className="bg-success hover:bg-success/90 text-success-foreground flex items-center gap-2 rounded-full shadow-lg"
                size="lg"
              >
                <Plus size={20} />
                Crear
              </Button>
            </Link>
          )}

          {isTrashView && (
            <Button
              variant="outline"
              onClick={() => setFilter('all')}
              className="flex items-center gap-2"
            >
              <XCircle size={20} />
              Salir de Papelera
            </Button>
          )}
        </div>

        {filteredPromotions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {isTrashView 
                ? 'No hay promociones en la papelera' 
                : 'No hay promociones disponibles'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPromotions.map((promotion) => (
              <Card 
                key={promotion.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 md:h-auto">
                    <img
                      src={getPromotionImage(promotion.image)}
                      alt={promotion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-primary">
                          {promotion.name}
                        </h3>
                        <span className="bg-success text-success-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {promotion.discount}% OFF
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {promotion.description}
                      </p>
                      
                      <p className="text-sm text-muted-foreground">
                        Vigencia: {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      {!isTrashView ? (
                        <>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Eye size={16} />
                            Ver
                          </Button>
                          <Link to={`/admin/promotions/${promotion.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Edit size={16} />
                              Editar
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteClick(promotion.id, promotion.name)}
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-success hover:bg-success hover:text-success-foreground"
                            onClick={() => handleRestore(promotion.id)}
                          >
                            <RotateCcw size={16} />
                            Restaurar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handlePermanentDelete(promotion.id, promotion.name)}
                          >
                            <Trash2 size={16} />
                            Eliminar permanentemente
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DeletePromotionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        promotionName={selectedPromotion?.name || ''}
      />
    </Layout>
  );
};

export default PromotionsList;
