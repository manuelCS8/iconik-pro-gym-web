import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Configuración de Hugging Face
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/nateraw/food101';
// URL alternativa para testing
const HUGGING_FACE_API_URL_ALT = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
const HUGGING_FACE_TOKEN = process.env.EXPO_PUBLIC_HUGGING_FACE_TOKEN || '';

// Configuración de OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = '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';

// Debug: Verificar si la API key se está leyendo correctamente
console.log('🔑 OpenAI API Key configurada:', OPENAI_API_KEY ? 'SÍ' : 'NO');
console.log('🔑 OpenAI API Key length:', OPENAI_API_KEY.length);
console.log('🔑 OpenAI API Key preview:', OPENAI_API_KEY.substring(0, 10) + '...');
console.log('🔑 Constants.expoConfig.extra:', Constants.expoConfig?.extra);

interface MealAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence: number;
  detectedFoods: string[];
  description?: string;
}

interface FoodNutritionData {
  [key: string]: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

// Base de datos de nutrición por alimento (simplificada)
const FOOD_NUTRITION_DB: FoodNutritionData = {
  'pizza': { calories: 266, protein: 11, carbs: 33, fats: 10 },
  'hamburger': { calories: 295, protein: 17, carbs: 30, fats: 12 },
  'salad': { calories: 20, protein: 2, carbs: 4, fats: 0 },
  'rice': { calories: 130, protein: 3, carbs: 28, fats: 0 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fats: 3.6 },
  'fish': { calories: 100, protein: 20, carbs: 0, fats: 2.5 },
  'beef': { calories: 250, protein: 26, carbs: 0, fats: 15 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fats: 1.1 },
  'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fats: 11 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1 },
  'cheese': { calories: 113, protein: 7, carbs: 0.4, fats: 9 },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fats: 0.1 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
  'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fats: 0.1 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fats: 0.2 },
  'potato': { calories: 77, protein: 2, carbs: 17, fats: 0.1 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4 },
};

class AIAnalysisService {
  private currentProvider: 'huggingface' | 'google' | 'openai' = 'openai';
  private imageCache: Map<string, MealAnalysis> = new Map();

  /**
   * Analiza una imagen de comida usando IA
   */
  async analyzeMealImage(imageUri: string, description?: string): Promise<MealAnalysis> {
    try {
      console.log('🔍 Starting AI analysis...');
      console.log('📸 Image URI:', imageUri);
      console.log('🤖 Current provider:', this.currentProvider);
      
      // 1. Comprimir imagen
      const compressedImage = await this.compressImage(imageUri);
      console.log('📦 Image compressed');
      
      // 2. Generar hash para cache
      const imageHash = await this.generateImageHash(compressedImage);
      
      // 3. Verificar cache
      const cached = this.imageCache.get(imageHash);
      if (cached) {
        console.log('✅ Using cached analysis');
        return cached;
      }
      
      // 4. Análisis según proveedor actual
      let analysis: MealAnalysis;
      
      try {
        switch (this.currentProvider) {
          case 'huggingface':
            console.log('🤖 Using Hugging Face...');
            analysis = await this.analyzeWithHuggingFace(compressedImage);
            break;
          case 'google':
            analysis = await this.analyzeWithGoogle(compressedImage, description);
            break;
          case 'openai':
            analysis = await this.analyzeWithOpenAI(compressedImage, description);
            break;
          default:
            analysis = await this.fallbackAnalysis(compressedImage);
        }
        
        // 5. Guardar en cache
        this.imageCache.set(imageHash, analysis);
        console.log('💾 Analysis cached');
        
        return analysis;
      } catch (error) {
        console.error('❌ Error with AI analysis, using fallback:', error);
        return await this.fallbackAnalysis(compressedImage);
      }
    } catch (error) {
      console.error('❌ Error in analyzeMealImage:', error);
      throw new Error('No se pudo analizar la imagen');
    }
  }

  /**
   * Análisis usando Hugging Face (gratis)
   */
  private async analyzeWithHuggingFace(imageUri: string): Promise<MealAnalysis> {
    try {
      console.log('🔄 Converting image to blob...');
      // Convertir imagen a blob
      const imageBlob = await this.imageToBlob(imageUri);
      console.log('📦 Image blob created, size:', imageBlob.size);
      
      console.log('🌐 Sending request to Hugging Face...');
      console.log('🔑 Using token:', HUGGING_FACE_TOKEN.substring(0, 10) + '...');
      console.log('🌐 URL:', HUGGING_FACE_API_URL);
      
      // Intentar con timeout más largo
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const response = await fetch(HUGGING_FACE_API_URL, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/octet-stream'
        },
        body: imageBlob,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Hugging Face result:', JSON.stringify(result, null, 2));
      
      return this.mapHuggingFaceResult(result);
    } catch (error) {
      console.error('❌ Error with Hugging Face:', error);
      throw error;
    }
  }

  /**
   * Mapea el resultado de Hugging Face a nuestro formato
   */
  private mapHuggingFaceResult(result: any[]): MealAnalysis {
    if (!Array.isArray(result) || result.length === 0) {
      return this.getDefaultAnalysis();
    }
    
    // Tomar los 3 alimentos más probables
    const topFoods = result.slice(0, 3);
    const detectedFoods: string[] = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalConfidence = 0;
    
    topFoods.forEach((food, index) => {
      const foodName = food.label.toLowerCase();
      const confidence = food.score;
      
      detectedFoods.push(foodName);
      totalConfidence += confidence;
      
      // Buscar en nuestra base de datos
      const nutrition = FOOD_NUTRITION_DB[foodName];
      if (nutrition) {
        // Ponderar por confianza
        const weight = index === 0 ? 0.6 : index === 1 ? 0.3 : 0.1;
        totalCalories += nutrition.calories * weight;
        totalProtein += nutrition.protein * weight;
        totalCarbs += nutrition.carbs * weight;
        totalFats += nutrition.fats * weight;
      }
    });
    
    // Si no encontramos datos, usar valores por defecto
    if (totalCalories === 0) {
      totalCalories = 300;
      totalProtein = 15;
      totalCarbs = 40;
      totalFats = 10;
    }
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      confidence: totalConfidence / topFoods.length,
      detectedFoods,
      description: `Detectado: ${detectedFoods.join(', ')}`
    };
  }

  /**
   * Análisis de fallback cuando la IA falla
   */
  private async fallbackAnalysis(imageUri: string): Promise<MealAnalysis> {
    console.log('Using fallback analysis');
    
    // Intentar análisis básico basado en la descripción del usuario
    const description = this.getImageDescription(imageUri);
    
    return {
      calories: this.estimateCalories(description),
      protein: this.estimateProtein(description),
      carbs: this.estimateCarbs(description),
      fats: this.estimateFats(description),
      confidence: 0.6,
      detectedFoods: [description],
      description: `Análisis estimado: ${description}`
    };
  }

  /**
   * Estimación básica basada en descripción
   */
  private getImageDescription(imageUri: string): string {
    // Por ahora, retornar una descripción genérica
    // En el futuro, podríamos usar OCR o análisis básico
    return 'comida casera';
  }

  private estimateCalories(description: string): number {
    const estimates: { [key: string]: number } = {
      'huevos': 150,
      'pan': 80,
      'leche': 120,
      'café': 5,
      'comida casera': 300,
      'ensalada': 100,
      'carne': 250,
      'pescado': 200,
      'pasta': 200,
      'arroz': 150
    };
    
    for (const [food, calories] of Object.entries(estimates)) {
      if (description.toLowerCase().includes(food)) {
        return calories;
      }
    }
    
    return 250; // Valor por defecto
  }

  private estimateProtein(description: string): number {
    const estimates: { [key: string]: number } = {
      'huevos': 12,
      'pan': 3,
      'leche': 8,
      'café': 0,
      'comida casera': 15,
      'ensalada': 5,
      'carne': 25,
      'pescado': 20,
      'pasta': 7,
      'arroz': 3
    };
    
    for (const [food, protein] of Object.entries(estimates)) {
      if (description.toLowerCase().includes(food)) {
        return protein;
      }
    }
    
    return 12; // Valor por defecto
  }

  private estimateCarbs(description: string): number {
    const estimates: { [key: string]: number } = {
      'huevos': 1,
      'pan': 15,
      'leche': 12,
      'café': 1,
      'comida casera': 35,
      'ensalada': 10,
      'carne': 0,
      'pescado': 0,
      'pasta': 40,
      'arroz': 30
    };
    
    for (const [food, carbs] of Object.entries(estimates)) {
      if (description.toLowerCase().includes(food)) {
        return carbs;
      }
    }
    
    return 30; // Valor por defecto
  }

  private estimateFats(description: string): number {
    const estimates: { [key: string]: number } = {
      'huevos': 10,
      'pan': 1,
      'leche': 5,
      'café': 0,
      'comida casera': 12,
      'ensalada': 5,
      'carne': 15,
      'pescado': 8,
      'pasta': 1,
      'arroz': 0
    };
    
    for (const [food, fats] of Object.entries(estimates)) {
      if (description.toLowerCase().includes(food)) {
        return fats;
      }
    }
    
    return 8; // Valor por defecto
  }

  /**
   * Comprime la imagen para optimizar el envío
   */
  private async compressImage(imageUri: string): Promise<string> {
    // Por ahora, retornar la imagen original sin comprimir
    // TODO: Implementar compresión cuando se resuelva el problema de ImageManipulator
    return imageUri;
  }

  /**
   * Convierte imagen a blob para envío
   */
  private async imageToBlob(imageUri: string): Promise<Blob> {
    try {
      const response = await fetch(imageUri);
      return await response.blob();
    } catch (error) {
      console.error('Error converting image to blob:', error);
      throw error;
    }
  }

  /**
   * Genera un hash simple de la imagen para cache
   */
  private async generateImageHash(imageUri: string): Promise<string> {
    // Hash simple basado en la URI y timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // Solo la fecha
    return `${imageUri}_${timestamp}`;
  }

  /**
   * Análisis con Google Cloud Vision (para futuro)
   */
  private async analyzeWithGoogle(imageUri: string, description?: string): Promise<MealAnalysis> {
    // TODO: Implementar cuando migremos a Google Cloud
    throw new Error('Google Cloud Vision not implemented yet');
  }

  /**
   * Análisis con OpenAI GPT-4 Vision
   */
  private async analyzeWithOpenAI(imageUri: string, description?: string): Promise<MealAnalysis> {
    try {
      console.log('🤖 Using OpenAI GPT-4 Vision...');
      
      // Convertir imagen a base64
      const base64Image = await this.imageToBase64(imageUri);
      
      const prompt = `Analiza esta imagen de comida y proporciona un análisis nutricional detallado. 

Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
{
  "calories": número,
  "protein": número en gramos,
  "carbs": número en gramos, 
  "fats": número en gramos,
  "confidence": número entre 0 y 1,
  "detectedFoods": ["alimento1", "alimento2"],
  "description": "descripción en español"
}

Descripción del usuario: ${description || 'No proporcionada'}

Sé preciso con las calorías y macros. Si no estás seguro, usa valores conservadores.`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI response error:', errorText);
        throw new Error(`OpenAI error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ OpenAI result:', JSON.stringify(result, null, 2));

      // Extraer el JSON de la respuesta
      const content = result.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Intentar parsear el JSON (con limpieza de markdown)
      try {
        let cleanContent = content.trim();
        
        // Remover markdown si está presente
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        
        console.log('🧹 Cleaned content:', cleanContent);
        
        const analysis = JSON.parse(cleanContent);
        return this.validateAnalysis(analysis);
      } catch (parseError) {
        console.error('❌ Error parsing OpenAI JSON:', parseError);
        console.log('📝 Raw content:', content);
        throw new Error('Invalid JSON response from OpenAI');
      }
    } catch (error) {
      console.error('❌ Error with OpenAI:', error);
      throw error;
    }
  }

  /**
   * Convierte imagen a base64 para OpenAI
   */
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remover el prefijo data:image/jpeg;base64,
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Cambia el proveedor de IA
   */
  setProvider(provider: 'huggingface' | 'google' | 'openai'): void {
    this.currentProvider = provider;
    console.log(`AI provider changed to: ${provider}`);
  }

  /**
   * Limpia el cache de imágenes
   */
  clearCache(): void {
    this.imageCache.clear();
    console.log('Image cache cleared');
  }

  /**
   * Análisis por defecto
   */
  private getDefaultAnalysis(): MealAnalysis {
    return {
      calories: 200,
      protein: 10,
      carbs: 25,
      fats: 6,
      confidence: 0.3,
      detectedFoods: ['comida'],
      description: 'No se pudo detectar alimento específico'
    };
  }

  /**
   * Valida que el análisis sea razonable
   */
  validateAnalysis(analysis: MealAnalysis): MealAnalysis {
    // Límites razonables
    const maxCalories = 2000;
    const maxProtein = 100;
    const maxCarbs = 200;
    const maxFats = 100;
    
    return {
      calories: Math.min(Math.max(analysis.calories, 0), maxCalories),
      protein: Math.min(Math.max(analysis.protein, 0), maxProtein),
      carbs: Math.min(Math.max(analysis.carbs, 0), maxCarbs),
      fats: Math.min(Math.max(analysis.fats, 0), maxFats),
      confidence: Math.min(Math.max(analysis.confidence, 0), 1),
      detectedFoods: analysis.detectedFoods,
      description: analysis.description
    };
  }
}

export default new AIAnalysisService(); 