import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { usePromotions } from '@/hooks/usePromotions';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package } from 'lucide-react';

const promotionSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().min(1, 'Descripción requerida'),
  category: z.string().min(1, 'Categoría requerida'),
  discount: z.coerce.number().min(1, 'Descuento debe ser mayor a 0').max(100, 'Descuento no puede ser mayor a 100'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  endDate: z.string().min(1, 'Fecha de fin requerida'),
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(data.startDate + 'T00:00:00');
  startDate.setHours(0, 0, 0, 0);
  return startDate >= today;
}, {
  message: 'La fecha de inicio no puede ser anterior a hoy',
  path: ['startDate'],
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'La fecha de fin debe ser igual o posterior a la fecha de inicio',
  path: ['endDate'],
});

type PromotionForm = z.infer<typeof promotionSchema>;

const categories = [
  { value: 'alimento', label: 'Alimento' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'cuidado', label: 'Cuidado e Higiene' },
  { value: 'accesorios', label: 'Accesorios' },
];

const productsByCategory: Record<string, Array<{id: string, name: string, price: number}>> = {
  alimento: [
    { id: '1', name: 'Alimento Premium para Perros', price: 45.99 },
    { id: '2', name: 'Alimento para Gatos Adultos', price: 32.50 },
    { id: '3', name: 'Snacks Naturales', price: 15.75 },
    { id: '4', name: 'Alimento para Cachorros', price: 38.90 },
  ],
  juguetes: [
    { id: '5', name: 'Pelota de Goma', price: 12.99 },
    { id: '6', name: 'Rascador para Gatos', price: 89.99 },
    { id: '7', name: 'Cuerda para Perros', price: 18.50 },
    { id: '8', name: 'Ratón de Peluche', price: 8.75 },
  ],
  cuidado: [
    { id: '9', name: 'Champú para Mascotas', price: 24.99 },
    { id: '10', name: 'Cepillo Dental', price: 16.50 },
    { id: '11', name: 'Toallitas Húmedas', price: 12.25 },
    { id: '12', name: 'Cortaúñas Profesional', price: 35.00 },
  ],
  accesorios: [
    { id: '13', name: 'Collar Ajustable', price: 22.99 },
    { id: '14', name: 'Correa Retráctil', price: 45.50 },
    { id: '15', name: 'Cama Acolchada', price: 75.00 },
    { id: '16', name: 'Bebedero Automático', price: 89.99 },
  ],
};

const EditPromotion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { promotions, isLoading, updatePromotion } = usePromotions();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<PromotionForm>>({});

  const promotion = promotions.find(p => p.id === id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    getValues,
  } = useForm<PromotionForm>({
    resolver: zodResolver(promotionSchema),
  });

  useEffect(() => {
    console.log('Promotions:', promotions);
    console.log('Looking for ID:', id);
    console.log('Found promotion:', promotion);
    console.log('Is Loading:', isLoading);
    
    if (isLoading) return;
    
    if (promotion) {
      setValue('name', promotion.name);
      setValue('description', promotion.description);
      setValue('category', promotion.category);
      setValue('discount', promotion.discount);
      setValue('startDate', promotion.startDate);
      setValue('endDate', promotion.endDate);
      setSelectedCategory(promotion.category);
      setSelectedProducts(promotion.selectedProducts || []);
    } else if (id) {
      toast({
        title: "Promoción no encontrada",
        variant: "destructive",
      });
      navigate('/admin/promotions');
    }
  }, [promotion, id, navigate, setValue, toast, isLoading]);

  const handleNextStep = async () => {
    const isValid = await trigger(['name', 'description', 'category', 'discount', 'startDate', 'endDate']);
    if (isValid) {
      const currentData = getValues();
      setFormData(currentData);
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: PromotionForm) => {
    if (currentStep === 1) {
      handleNextStep();
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un producto",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const imageMap: Record<string, string> = {
        'alimento': 'dog-products',
        'juguetes': 'cat-products',
        'cuidado': 'dog-products',
        'accesorios': 'cat-products',
      };

      if (id) {
        updatePromotion(id, {
          name: formData.name || data.name,
          description: formData.description || data.description,
          category: formData.category || data.category,
          discount: formData.discount || data.discount,
          startDate: formData.startDate || data.startDate,
          endDate: formData.endDate || data.endDate,
          image: imageMap[formData.category || data.category] || 'dog-products',
          selectedProducts: selectedProducts,
        });

        toast({
          title: "Promoción actualizada",
          description: "La promoción se ha actualizado exitosamente",
        });
        
        navigate('/admin/promotions');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar la promoción",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const renderStep1 = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la promoción</Label>
        <Input
          id="name"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Fecha de inicio</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate')}
            className={errors.startDate ? 'border-destructive' : ''}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Fecha de fin</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate')}
            className={errors.endDate ? 'border-destructive' : ''}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={4}
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setValue('category', value);
            }}
          >
            <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount">Porcentaje de descuento</Label>
          <Input
            id="discount"
            type="number"
            min="1"
            max="100"
            {...register('discount')}
            className={errors.discount ? 'border-destructive' : ''}
          />
          {errors.discount && (
            <p className="text-sm text-destructive">{errors.discount.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="cancel"
          className="flex-1"
          onClick={() => navigate('/admin/promotions')}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
        >
          Siguiente
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => {
    const categoryProducts = productsByCategory[selectedCategory] || [];
    
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePreviousStep}
              className="p-2"
            >
              <ArrowLeft size={16} />
            </Button>
            <div>
              <h3 className="text-lg font-semibold text-primary">Seleccionar Productos</h3>
              <p className="text-sm text-muted-foreground">
                Categoría: {categories.find(c => c.value === selectedCategory)?.label}
              </p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {categoryProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`p-4 cursor-pointer transition-colors ${
                  selectedProducts.includes(product.id) 
                    ? 'bg-accent border-primary' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => toggleProductSelection(product.id)}
              >
                <div className="flex items-center gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProductSelection(product.id)}
                      className="h-5 w-5"
                    />
                  </div>
                  <Package size={20} className="text-muted-foreground" />
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">${product.price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {selectedProducts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Selecciona al menos un producto para continuar
            </p>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="cancel"
            className="flex-1"
            onClick={handlePreviousStep}
          >
            Anterior
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            disabled={loading || selectedProducts.length === 0}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <p className="text-muted-foreground">Cargando...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!promotion) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Editar Promoción - Paso {currentStep} de 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditPromotion;
