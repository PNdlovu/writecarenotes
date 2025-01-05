# Special Needs Assessment API Documentation

## API Endpoints

### Assessment Management

#### Get All Assessments
```http
GET /api/assessments
```

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `status`: string ('draft' | 'in_progress' | 'completed' | 'archived')
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "data": [Assessment],
  "total": number,
  "page": number,
  "limit": number
}
```

#### Get Assessment by ID
```http
GET /api/assessments/:id
```

**Response:**
```json
{
  "data": Assessment
}
```

#### Create Assessment
```http
POST /api/assessments
```

**Request Body:**
```json
{
  "residentId": string,
  "assessorId": string,
  "communication": CommunicationSection,
  "mobility": MobilitySection,
  "sensory": SensorySection,
  "cognitive": CognitiveSection,
  "behavioral": BehavioralSection,
  "specializedCare": SpecializedCareSection,
  "progress": ProgressSection
}
```

#### Update Assessment
```http
PUT /api/assessments/:id
```

**Request Body:**
```json
{
  "id": string,
  "status": string,
  "sections": {...}
}
```

#### Delete Assessment
```http
DELETE /api/assessments/:id
```

### Search and Export

#### Search Assessments
```http
GET /api/assessments/search
```

**Query Parameters:**
- `q`: string
- `filters`: object
- `sort`: string
- `order`: 'asc' | 'desc'

#### Export Assessment
```http
GET /api/assessments/:id/export/pdf
```

**Response:**
Binary PDF file

### Data Types

#### Assessment
```typescript
interface Assessment {
  id: string;
  residentId: string;
  assessorId: string;
  dateCreated: string;
  lastModified: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  communication: CommunicationSection;
  mobility: MobilitySection;
  sensory: SensorySection;
  cognitive: CognitiveSection;
  behavioral: BehavioralSection;
  specializedCare: SpecializedCareSection;
  progress: ProgressSection;
}
```

### Error Handling

#### Error Response Format
```json
{
  "error": {
    "code": string,
    "message": string,
    "details": object
  }
}
```

#### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

### Rate Limiting

- Rate limit: 1000 requests per minute
- Headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### Authentication

All endpoints require a valid JWT token in the Authorization header:
```http
Authorization: Bearer <token>
```

### Versioning

API version is specified in the URL:
```http
https://api.writecarenotes.com/v1/assessments
```

### Best Practices

1. **Error Handling**
   - Always check response status
   - Handle network errors
   - Implement retry logic

2. **Performance**
   - Use pagination
   - Implement caching
   - Batch requests

3. **Security**
   - Validate input
   - Sanitize output
   - Use HTTPS
   - Implement rate limiting
