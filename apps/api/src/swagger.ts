import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Meridian Market API',
    version: '1.0.0',
    description:
      'REST API for the Meridian Market micro frontend platform. Authenticate with **Authorize**, then try cart and order routes. Demo users: `maya@meridian.shop` / `meridian123` and `guest@meridian.shop` / `guest123`.'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local development' }],
  tags: [
    { name: 'System', description: 'Health and feature flags' },
    { name: 'Auth', description: 'JWT login' },
    { name: 'Products', description: 'Catalog' },
    { name: 'Cart', description: 'Authenticated cart' },
    { name: 'Orders', description: 'Authenticated checkout and ledger' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      guestId: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Guest-Id',
        description: 'Anonymous cart identity. Sent automatically by the storefront if you are not signed in.'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { message: { type: 'string' } }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'u1' },
          name: { type: 'string', example: 'Maya Chen' },
          email: { type: 'string', example: 'maya@meridian.shop' },
          role: { type: 'string', enum: ['customer', 'guest'] }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'maya@meridian.shop' },
          password: { type: 'string', example: 'meridian123' }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'p1' },
          name: { type: 'string' },
          price: { type: 'number' },
          category: {
            type: 'string',
            enum: ['Tableware', 'Lighting', 'Textiles', 'Furniture', 'Objects']
          },
          description: { type: 'string' },
          image: { type: 'string' },
          stock: { type: 'integer' },
          artisan: { type: 'string' }
        }
      },
      CartItem: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'integer' },
          image: { type: 'string' }
        }
      },
      Cart: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          totalItems: { type: 'integer' },
          totalPrice: { type: 'number' }
        }
      },
      AddToCartRequest: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string', example: 'p1' },
          quantity: { type: 'integer', minimum: 1, default: 1 }
        }
      },
      UpdateCartRequest: {
        type: 'object',
        properties: {
          quantity: { type: 'integer', example: 2, description: 'Use 0 or omit to remove the line.' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          totalPrice: { type: 'number' },
          status: { type: 'string', enum: ['placed', 'packed', 'shipped'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Health: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          uptime: { type: 'integer' },
          service: { type: 'string', example: 'meridian-api' }
        }
      },
      FeatureFlags: {
        type: 'object',
        properties: {
          newCheckout: { type: 'boolean' },
          artisanNotes: { type: 'boolean' },
          crossTabSync: { type: 'boolean' }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Service health',
        responses: {
          '200': {
            description: 'API is up',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' } } }
          }
        }
      }
    },
    '/api/flags': {
      get: {
        tags: ['System'],
        summary: 'Feature flags',
        responses: {
          '200': {
            description: 'Current flags',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FeatureFlags' } } }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in and receive a JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List catalog items',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['Tableware', 'Lighting', 'Textiles', 'Furniture', 'Objects']
            }
          },
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search name or artisan' }
        ],
        responses: {
          '200': {
            description: 'Product list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
              }
            }
          }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get one product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: 'p1' } }],
        responses: {
          '200': {
            description: 'Product',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } }
          },
          '404': {
            description: 'Not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get the current cart',
        security: [{ bearerAuth: [] }, { guestId: [] }],
        responses: {
          '200': {
            description: 'Cart',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } }
          },
          '401': {
            description: 'Missing or invalid token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      },
      post: {
        tags: ['Cart'],
        summary: 'Add an item to the cart',
        security: [{ bearerAuth: [] }, { guestId: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AddToCartRequest' } } }
        },
        responses: {
          '201': {
            description: 'Updated cart',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } }
          },
          '400': {
            description: 'Invalid product or quantity',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/api/cart/{id}': {
      put: {
        tags: ['Cart'],
        summary: 'Update a cart line quantity',
        security: [{ bearerAuth: [] }, { guestId: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product id' }
        ],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCartRequest' } } }
        },
        responses: {
          '200': {
            description: 'Updated cart',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          '404': {
            description: 'Cart item not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove a cart line',
        security: [{ bearerAuth: [] }, { guestId: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Product id' }
        ],
        responses: {
          '200': {
            description: 'Updated cart',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders for the signed-in user',
        security: [{ bearerAuth: [] }, { guestId: [] }],
        responses: {
          '200': {
            description: 'Orders',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      },
      post: {
        tags: ['Orders'],
        summary: 'Place an order from the current cart',
        security: [{ bearerAuth: [] }, { guestId: [] }],
        responses: {
          '201': {
            description: 'Order created and cart cleared',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } }
          },
          '400': {
            description: 'Cart is empty',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } }
          }
        }
      }
    }
  }
};

export function mountSwagger(app: Express) {
  app.get('/api/docs.json', (_req, res) => {
    res.json(spec);
  });
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      customSiteTitle: 'Meridian Market API',
      swaggerOptions: { persistAuthorization: true }
    })
  );
}
