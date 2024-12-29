/**
 * @fileoverview OpenAPI documentation for Organizations API
 * @version 1.0.0
 * @created 2024-03-21
 */

export const organizationsApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Write Care Notes Organizations API',
    version: '1.0.0',
    description: 'API for managing organizations in the Write Care Notes platform',
    contact: {
      name: 'Write Care Notes Support',
      email: 'support@writecarenotes.com'
    },
    license: {
      name: 'Private',
      url: 'https://writecarenotes.com/terms'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Production server'
    }
  ],
  tags: [
    {
      name: 'Organizations',
      description: 'Organization management endpoints'
    },
    {
      name: 'Care Homes',
      description: 'Care home management within organizations'
    },
    {
      name: 'Settings',
      description: 'Organization settings management'
    },
    {
      name: 'Analytics',
      description: 'Organization analytics and reporting'
    }
  ],
  paths: {
    '/organizations': {
      get: {
        tags: ['Organizations'],
        summary: 'List organizations',
        description: 'Get a paginated list of organizations with optional filtering',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            schema: { type: 'integer', default: 10 }
          },
          {
            name: 'status',
            in: 'query',
            description: 'Organization status filter',
            schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] }
          },
          {
            name: 'region',
            in: 'query',
            description: 'Region filter',
            schema: { type: 'string' }
          },
          {
            name: 'type',
            in: 'query',
            description: 'Organization type filter',
            schema: { type: 'string' }
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search term',
            schema: { type: 'string' }
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Field to sort by',
            schema: { type: 'string' }
          },
          {
            name: 'sortOrder',
            in: 'query',
            description: 'Sort order',
            schema: { type: 'string', enum: ['asc', 'desc'] }
          }
        ],
        responses: {
          '200': {
            description: 'List of organizations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    organizations: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Organization' }
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      },
      post: {
        tags: ['Organizations'],
        summary: 'Create organization',
        description: 'Create a new organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrganizationInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Organization created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/organizations/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Organization ID',
          schema: { type: 'string' }
        }
      ],
      get: {
        tags: ['Organizations'],
        summary: 'Get organization',
        description: 'Get organization by ID',
        responses: {
          '200': {
            description: 'Organization details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      },
      patch: {
        tags: ['Organizations'],
        summary: 'Update organization',
        description: 'Update an existing organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrganizationInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Organization updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      },
      delete: {
        tags: ['Organizations'],
        summary: 'Delete organization',
        description: 'Delete an organization',
        responses: {
          '204': { description: 'Organization deleted' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/organizations/{id}/settings': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Organization ID',
          schema: { type: 'string' }
        }
      ],
      patch: {
        tags: ['Settings'],
        summary: 'Update settings',
        description: 'Update organization settings',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrganizationSettings' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Settings updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/organizations/{id}/care-homes': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Organization ID',
          schema: { type: 'string' }
        }
      ],
      post: {
        tags: ['Care Homes'],
        summary: 'Add care home',
        description: 'Add a care home to an organization',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['careHomeId'],
                properties: {
                  careHomeId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Care home added',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/organizations/{id}/care-homes/{careHomeId}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Organization ID',
          schema: { type: 'string' }
        },
        {
          name: 'careHomeId',
          in: 'path',
          required: true,
          description: 'Care Home ID',
          schema: { type: 'string' }
        }
      ],
      delete: {
        tags: ['Care Homes'],
        summary: 'Remove care home',
        description: 'Remove a care home from an organization',
        responses: {
          '200': {
            description: 'Care home removed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Organization' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/organizations/analytics': {
      get: {
        tags: ['Analytics'],
        summary: 'Get analytics',
        description: 'Get organization analytics',
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            description: 'Organization ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Organization analytics',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrganizationAnalytics' }
              }
            }
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' }
        }
      }
    }
  },
  components: {
    schemas: {
      Organization: {
        type: 'object',
        required: ['id', 'name', 'type', 'status'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['SINGLE_SITE', 'MULTI_SITE', 'ENTERPRISE']
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
          },
          settings: { $ref: '#/components/schemas/OrganizationSettings' },
          careHomes: {
            type: 'array',
            items: { type: 'string' }
          },
          metadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              createdBy: { type: 'string' },
              updatedBy: { type: 'string' },
              version: { type: 'integer' }
            }
          }
        }
      },
      CreateOrganizationInput: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: {
            type: 'string',
            enum: ['SINGLE_SITE', 'MULTI_SITE', 'ENTERPRISE']
          },
          settings: { $ref: '#/components/schemas/OrganizationSettings' }
        }
      },
      UpdateOrganizationInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: {
            type: 'string',
            enum: ['SINGLE_SITE', 'MULTI_SITE', 'ENTERPRISE']
          },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED']
          },
          settings: { $ref: '#/components/schemas/OrganizationSettings' }
        }
      },
      OrganizationSettings: {
        type: 'object',
        properties: {
          security: {
            type: 'object',
            properties: {
              mfa: { type: 'boolean' },
              passwordPolicy: {
                type: 'object',
                properties: {
                  minLength: { type: 'integer' },
                  requireSpecialChars: { type: 'boolean' },
                  requireNumbers: { type: 'boolean' },
                  expiryDays: { type: 'integer' }
                }
              },
              ipWhitelist: {
                type: 'array',
                items: { type: 'string' }
              },
              sessionTimeout: { type: 'integer' }
            }
          },
          regional: {
            type: 'object',
            properties: {
              primaryRegion: { type: 'string' },
              supportedRegions: {
                type: 'array',
                items: { type: 'string' }
              },
              primaryLanguage: { type: 'string' },
              supportedLanguages: {
                type: 'array',
                items: { type: 'string' }
              },
              timezone: { type: 'string' },
              dateFormat: { type: 'string' },
              currencyCode: { type: 'string' }
            }
          }
        }
      },
      OrganizationAnalytics: {
        type: 'object',
        properties: {
          metrics: {
            type: 'object',
            properties: {
              totalCareHomes: { type: 'integer' },
              activeUsers: { type: 'integer' },
              complianceScore: { type: 'number' }
            }
          },
          careHomes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                metrics: {
                  type: 'object',
                  properties: {
                    residents: { type: 'integer' },
                    staff: { type: 'integer' },
                    occupancy: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' }
              }
            }
          }
        }
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    { bearerAuth: [] }
  ]
}; 