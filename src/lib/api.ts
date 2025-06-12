import { Question, QuizStep, ChatMessage, QuizAnswer } from './types';
import { Product } from '@/types';
import { mockQuestions, mockProducts } from './utils';
import { SearchRequest, SearchResponse, ChatRequest, ChatResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = new APIError(
      response.status,
      `API request failed with status ${response.status}`
    );
    throw error;
  }
  return response.json();
}

// Simulate fetching questions
export async function fetchQuestions(): Promise<Question[]> {
  return Promise.resolve(mockQuestions);
}

// Simulate fetching products for a category
export async function fetchProducts(filters: SearchRequest['filters'] = {}, limit: number = 10): Promise<Product[]> {
  console.log('[fetchProducts] Called with filters:', filters, 'and limit:', limit);
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filters: { ...filters }
    })
  });
  
  if (!response.ok) {
    console.error('[fetchProducts] Search request failed with status:', response.status);
    throw new Error('Search request failed');
  }
  
  const data = await response.json();
  console.log('[fetchProducts] Response data:', data);
  if (data && Array.isArray(data.products)) {
    console.log(`[fetchProducts] Number of products returned: ${data.products.length}`);
    console.log('[fetchProducts] Product IDs:', data.products.map(p => p.id));
    if (data.products.length > 0) {
      console.log('[fetchProducts] First product shape:', Object.keys(data.products[0]));
    }
  } else {
    console.warn('[fetchProducts] No products array in response:', data);
  }
  return data.products;
}

// Simulate chat endpoint
export async function sendChatMessage(message: string, context: Product[]): Promise<ChatMessage> {
  return Promise.resolve({
    id: Math.random().toString(36).substr(2, 9),
    sender: 'gpt',
    text: `This is a mock GPT reply to: "${message}". (Context: ${context.map(p => p.title).join(', ')})`,
    timestamp: Date.now(),
  });
}

export async function askAboutProducts(
  message: string, 
  products: Product[],
  quizState: { answers: QuizAnswer[], summary: string, chatMessages: ChatMessage[] }
): Promise<string> {
  try {
    const requestPayload = {
      message,
      context: {
        products,
        answers: quizState.answers,
        summary: quizState.summary,
        chatMessages: quizState.chatMessages
      }
    };
    
    console.log('[askAboutProducts] Sending request to backend:', {
      url: `${API_BASE_URL}/chat`,
      payload: requestPayload
    });

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      console.error('[askAboutProducts] Backend responded with error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      
      // Try to get error details from response
      const errorData = await response.json().catch(() => null);
      console.error('[askAboutProducts] Error details:', errorData);
    }

    const data = await handleResponse<ChatResponse>(response);
    return data.reply;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Failed to get chat response');
  }
}
