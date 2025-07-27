
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Heart, MapPin, Bed, Bath, Maximize, Home, List, Map, Star, Phone, Mail, Filter, X } from 'lucide-react';
import type { Property, PropertyFilters, PropertyWithImages, City, PropertyType } from '../../server/src/schema';

// Sample property data for initial display since handlers return empty arrays
const sampleProperties: Property[] = [
  {
    id: 1,
    title: "Luxury Villa in Cascais",
    description: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean. This magnificent property features modern architecture blended with traditional Portuguese elements.",
    price: 1250000,
    city: "lisbon" as City,
    address: "Avenida Marginal, Cascais",
    latitude: 38.6979,
    longitude: -9.4215,
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 320,
    property_type: "villa" as PropertyType,
    is_featured: true,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: 2,
    title: "Modern Apartment in Porto Historic Center",
    description: "Beautifully renovated apartment in the heart of Porto's UNESCO World Heritage historic center. Walking distance to all major attractions.",
    price: 450000,
    city: "porto" as City,
    address: "Rua das Flores, Porto",
    latitude: 41.1579,
    longitude: -8.6291,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 85,
    property_type: "apartment" as PropertyType,
    is_featured: true,
    created_at: new Date('2024-01-10'),
    updated_at: new Date('2024-01-10')
  },
  {
    id: 3,
    title: "Charming House in Óbidos",
    description: "Traditional Portuguese house within the medieval walls of Óbidos. Completely restored with modern amenities while preserving historical charm.",
    price: 320000,
    city: "lisbon" as City,
    address: "Rua Direita, Óbidos",
    latitude: 39.3606,
    longitude: -9.1575,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 150,
    property_type: "house" as PropertyType,
    is_featured: false,
    created_at: new Date('2024-01-08'),
    updated_at: new Date('2024-01-08')
  },
  {
    id: 4,
    title: "Beachfront Apartment in Algarve",
    description: "Contemporary beachfront apartment with direct access to golden sand beaches. Perfect for vacation rental or permanent residence.",
    price: 680000,
    city: "algarve" as City,
    address: "Praia da Rocha, Portimão",
    latitude: 37.1174,
    longitude: -8.5391,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 120,
    property_type: "apartment" as PropertyType,
    is_featured: true,
    created_at: new Date('2024-01-12'),
    updated_at: new Date('2024-01-12')
  },
  {
    id: 5,
    title: "Country Villa in Douro Valley",
    description: "Exclusive villa surrounded by vineyards in the famous Douro Valley. Includes private wine cellar and infinity pool.",
    price: 890000,
    city: "porto" as City,
    address: "Quinta do Douro, Peso da Régua",
    latitude: 41.1621,
    longitude: -7.7876,
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 280,
    property_type: "villa" as PropertyType,
    is_featured: false,
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-01-05')
  }
];

const propertyImages = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=400&fit=crop"
];

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithImages | null>(null);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [activeTab, setActiveTab] = useState('home');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showFilters, setShowFilters] = useState(false);

  // Load properties with filters
  const loadProperties = useCallback(async () => {
    try {
      const result = await trpc.getProperties.query(filters);
      // If API returns empty data, use sample data for demonstration
      if (result.length === 0) {
        const filteredProperties = sampleProperties.filter((property: Property) => {
          if (filters.city && property.city !== filters.city) return false;
          if (filters.min_price && property.price < filters.min_price) return false;
          if (filters.max_price && property.price > filters.max_price) return false;
          if (filters.bedrooms && property.bedrooms !== filters.bedrooms) return false;
          if (filters.property_type && property.property_type !== filters.property_type) return false;
          if (filters.is_featured !== undefined && property.is_featured !== filters.is_featured) return false;
          return true;
        });
        setProperties(filteredProperties);
      } else {
        setProperties(result);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
      setProperties(sampleProperties);
    }
  }, [filters]);

  // Load featured properties
  const loadFeaturedProperties = useCallback(async () => {
    try {
      const result = await trpc.getFeaturedProperties.query();
      if (result.length === 0) {
        setFeaturedProperties(sampleProperties.filter((property: Property) => property.is_featured));
      } else {
        setFeaturedProperties(result);
      }
    } catch (error) {
      console.error('Failed to load featured properties:', error);
      setFeaturedProperties(sampleProperties.filter((property: Property) => property.is_featured));
    }
  }, []);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    try {
      const result = await trpc.getFavorites.query({ session_id: sessionId });
      const favoriteIds = result.map((property: Property) => property.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
      const stored = localStorage.getItem(`favorites_${sessionId}`);
      setFavorites(stored ? JSON.parse(stored) : []);
    }
  }, [sessionId]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    loadFeaturedProperties();
  }, [loadFeaturedProperties]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (propertyId: number) => {
    try {
      const isFavorite = favorites.includes(propertyId);
      
      if (isFavorite) {
        await trpc.removeFavorite.mutate({ session_id: sessionId, property_id: propertyId });
      } else {
        await trpc.addFavorite.mutate({ session_id: sessionId, property_id: propertyId });
      }
      
      const newFavorites = isFavorite 
        ? favorites.filter((id: number) => id !== propertyId)
        : [...favorites, propertyId];
      
      setFavorites(newFavorites);
      localStorage.setItem(`favorites_${sessionId}`, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      const isFavorite = favorites.includes(propertyId);
      const newFavorites = isFavorite 
        ? favorites.filter((id: number) => id !== propertyId)
        : [...favorites, propertyId];
      
      setFavorites(newFavorites);
      localStorage.setItem(`favorites_${sessionId}`, JSON.stringify(newFavorites));
    }
  };

  const openPropertyDetails = async (propertyId: number) => {
    try {
      const result = await trpc.getPropertyById.query({ id: propertyId });
      if (result) {
        setSelectedProperty(result);
        setIsPropertyDialogOpen(true);
      } else {
        // Create property with images from available data
        const property = properties.find((p: Property) => p.id === propertyId);
        if (property) {
          const propertyWithImages: PropertyWithImages = {
            ...property,
            images: propertyImages.slice(0, 3).map((url: string, index: number) => ({
              id: index + 1,
              property_id: propertyId,
              image_url: url,
              alt_text: `${property.title} - Image ${index + 1}`,
              is_primary: index === 0,
              sort_order: index,
              created_at: new Date()
            }))
          };
          setSelectedProperty(propertyWithImages);
          setIsPropertyDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to load property details:', error);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatCity = (city: string): string => {
    return city.charAt(0).toUpperCase() + city.slice(1);
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={propertyImages[property.id % propertyImages.length]}
            alt={property.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(property.id);
            }}
          >
            <Heart 
              className={`h-4 w-4 ${
                favorites.includes(property.id)
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-600'
              }`}
            />
          </Button>
          {property.is_featured && (
            <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-blue-600 text-white font-bold">
              {formatPrice(property.price)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1 text-red-500" />
          <span className="text-sm">{formatCity(property.city)}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {property.bedrooms}
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {property.bathrooms}
          </div>
          <div className="flex items-center">
            <Maximize className="h-4 w-4 mr-1" />
            {property.area_sqm}m²
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => openPropertyDetails(property.id)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );

  const FiltersBar = () => (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Filter Properties</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${showFilters || 'hidden lg:grid'}`}>
        <Select
          value={filters.city || 'all'}
          onValueChange={(value) => 
            setFilters((prev: PropertyFilters) => ({ 
              ...prev, 
              city: value === 'all' ? undefined : value as City 
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            <SelectItem value="lisbon">Lisbon</SelectItem>
            <SelectItem value="porto">Porto</SelectItem>
            <SelectItem value="algarve">Algarve</SelectItem>
            <SelectItem value="braga">Braga</SelectItem>
            <SelectItem value="coimbra">Coimbra</SelectItem>
            <SelectItem value="aveiro">Aveiro</SelectItem>
            <SelectItem value="funchal">Funchal</SelectItem>
            <SelectItem value="faro">Faro</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min Price (€)"
          value={filters.min_price || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters((prev: PropertyFilters) => ({ 
              ...prev, 
              min_price: e.target.value ? parseInt(e.target.value) : undefined 
            }))
          }
        />

        <Input
          type="number"
          placeholder="Max Price (€)"
          value={filters.max_price || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters((prev: PropertyFilters) => ({ 
              ...prev, 
              max_price: e.target.value ? parseInt(e.target.value) : undefined 
            }))
          }
        />

        <Select
          value={filters.bedrooms?.toString() || 'all'}
          onValueChange={(value) => 
            setFilters((prev: PropertyFilters) => ({ 
              ...prev, 
              bedrooms: value === 'all' ? undefined : parseInt(value) 
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Bedrooms</SelectItem>
            <SelectItem value="1">1 Bedroom</SelectItem>
            <SelectItem value="2">2 Bedrooms</SelectItem>
            <SelectItem value="3">3 Bedrooms</SelectItem>
            <SelectItem value="4">4 Bedrooms</SelectItem>
            <SelectItem value="5">5+ Bedrooms</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.property_type || 'all'}
          onValueChange={(value) => 
            setFilters((prev: PropertyFilters) => ({ 
              ...prev, 
              property_type: value === 'all' ? undefined : value as PropertyType 
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(filters.city || filters.min_price || filters.max_price || filters.bedrooms || filters.property_type) && (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({})}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Top Casas PT</h1>
            </div>
            <p className="hidden md:block text-gray-600">Portugal's Premium Real Estate</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="home" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Listings</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2 hidden lg:flex">
                <Phone className="h-4 w-4" />
                Contact
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Home Tab */}
          <TabsContent value="home" className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-2xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Top Casas PT</h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Discover Portugal's finest properties from stunning coastal villas to charming city apartments
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => setActiveTab('listings')}
              >
                Explore Properties
              </Button>
            </div>

            {/* Featured Properties */}
            <div>
              <h3 className="text-3xl font-bold text-center mb-8 text-blue-900">
                🏆 Top Houses of the Week
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProperties.map((property: Property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <FiltersBar />
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-900">
                All Properties ({properties.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property: Property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {properties.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setFilters({})}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4 text-blue-900">Interactive Map View</h3>
              <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Interactive map integration would be implemented here using Google Maps API
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    • Property pins showing location<br/>
                    • Click for quick property preview<br/>
                    • Navigate to full details
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-900">
                💖 Your Favorite Properties ({favorites.length})
              </h3>
              {favorites.length === 0 ? (
                <Card className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">No favorites yet</h4>
                  <p className="text-gray-600 mb-4">
                    Start adding properties to your favorites by clicking the heart icon
                  </p>
                  <Button onClick={() => setActiveTab('listings')}>
                    Browse Properties
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties
                    .filter((property: Property) => favorites.includes(property.id))
                    .map((property: Property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-blue-900">Contact Us</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Get in Touch</h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-600 mr-3" />
                      <span>+351 21 123 4567</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-3" />
                      <span>info@topcasaspt.com</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                      <span>Lisbon, Portugal</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">About Top Casas PT</h4>
                  <p className="text-gray-600">
                    We are Portugal's premier real estate platform, connecting buyers with the finest 
                    properties across the country. From historic city centers to stunning coastal locations, 
                    we help you find your perfect home in Portugal.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Property Details Dialog */}
      <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {selectedProperty.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image Gallery */}
                <Carousel className="w-full">
                  <CarouselContent>
                    {selectedProperty.images.map((image) => (
                      <CarouselItem key={image.id}>
                        <img
                          src={image.image_url}
                          alt={image.alt_text}
                          className="w-full h-64 md:h-96 object-cover rounded-lg"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>

                {/* Property Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Property Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-bold text-blue-600">
                          {formatPrice(selectedProperty.price)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{formatCity(selectedProperty.city)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bedrooms:</span>
                        <span>{selectedProperty.bedrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bathrooms:</span>
                        <span>{selectedProperty.bathrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Area:</span>
                        <span>{selectedProperty.area_sqm}m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="capitalize">{selectedProperty.property_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Description</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProperty.description}
                    </p>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div>
                  <h4 className="text-lg font-semibol mb-3">Location</h4>
                  <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">{selectedProperty.address}</p>
                      <p className="text-sm text-gray-500">
                        Map integration would show property location
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call for Information
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => toggleFavorite(selectedProperty.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 mr-2 ${
                        favorites.includes(selectedProperty.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600'
                      }`}
                    />
                    {favorites.includes(selectedProperty.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
