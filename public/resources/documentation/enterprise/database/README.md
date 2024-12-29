# Database Schema Documentation

## Overview
Write Care Notes uses a multi-tenant database architecture with PostgreSQL as the primary database.

## Schema Design

### Core Tables

#### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50),
    address JSONB,
    contact_details JSONB,
    settings JSONB,
    subscription_tier VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### facilities
```sql
CREATE TABLE facilities (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    capacity INTEGER,
    address JSONB,
    contact_details JSONB,
    registration_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50),
    permissions JSONB,
    settings JSONB,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Resident Management

#### residents
```sql
CREATE TABLE residents (
    id UUID PRIMARY KEY,
    facility_id UUID REFERENCES facilities(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    nhs_number VARCHAR(50),
    room_number VARCHAR(50),
    admission_date DATE,
    discharge_date DATE,
    status VARCHAR(50),
    medical_details JSONB,
    contact_details JSONB,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### care_plans
```sql
CREATE TABLE care_plans (
    id UUID PRIMARY KEY,
    resident_id UUID REFERENCES residents(id),
    type VARCHAR(50),
    status VARCHAR(50),
    start_date DATE,
    review_date DATE,
    details JSONB,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Care Delivery

#### assessments
```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    resident_id UUID REFERENCES residents(id),
    type VARCHAR(50),
    date DATE,
    findings JSONB,
    recommendations JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### daily_records
```sql
CREATE TABLE daily_records (
    id UUID PRIMARY KEY,
    resident_id UUID REFERENCES residents(id),
    date DATE,
    shift VARCHAR(50),
    care_delivered JSONB,
    observations JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Quality Assurance

#### audits
```sql
CREATE TABLE audits (
    id UUID PRIMARY KEY,
    facility_id UUID REFERENCES facilities(id),
    type VARCHAR(50),
    date DATE,
    auditor UUID REFERENCES users(id),
    findings JSONB,
    score DECIMAL,
    action_plan JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### incidents
```sql
CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    facility_id UUID REFERENCES facilities(id),
    resident_id UUID REFERENCES residents(id),
    type VARCHAR(50),
    date TIMESTAMPTZ,
    details JSONB,
    actions_taken JSONB,
    reported_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Indexes

### Performance Indexes
```sql
CREATE INDEX idx_residents_facility ON residents(facility_id);
CREATE INDEX idx_care_plans_resident ON care_plans(resident_id);
CREATE INDEX idx_daily_records_resident_date ON daily_records(resident_id, date);
CREATE INDEX idx_audits_facility_date ON audits(facility_id, date);
```

### Search Indexes
```sql
CREATE INDEX idx_residents_name ON residents(first_name, last_name);
CREATE INDEX idx_residents_nhs ON residents(nhs_number);
CREATE INDEX idx_users_email ON users(email);
```

## Partitioning

### Time-Based Partitioning
```sql
-- Daily Records Partitioning
CREATE TABLE daily_records_partition OF daily_records
PARTITION BY RANGE (date);

-- Create Monthly Partitions
CREATE TABLE daily_records_y2024m01 
PARTITION OF daily_records_partition
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## Security

### Row Level Security
```sql
-- Organization Level Security
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_policy ON residents
    USING (facility_id IN (
        SELECT id FROM facilities 
        WHERE organization_id = current_setting('app.current_org_id')::uuid
    ));
```

### Data Encryption
```sql
-- Encrypted Columns
CREATE EXTENSION pgcrypto;

-- Example of encrypted personal data
ALTER TABLE residents
    ADD COLUMN encrypted_medical_notes bytea;
```

## Backup & Recovery

### Backup Strategy
```sql
-- Point-in-Time Recovery
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'test ! -f /mnt/archive/%f && cp %p /mnt/archive/%f';
```

## Maintenance

### Vacuum Settings
```sql
-- Automated Vacuum
ALTER TABLE daily_records SET (
    autovacuum_vacuum_threshold = 1000,
    autovacuum_analyze_threshold = 1000,
    autovacuum_vacuum_scale_factor = 0.2
);
```

## Monitoring

### Performance Views
```sql
-- Create monitoring view
CREATE VIEW performance_metrics AS
SELECT 
    schemaname,
    relname,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables;
```

## Migration Scripts

### Version Control
```sql
-- Version tracking table
CREATE TABLE schema_versions (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);
```

## Best Practices

### Query Optimization
- Use prepared statements
- Implement connection pooling
- Regular ANALYZE
- Index maintenance
- Query planning

### Data Integrity
- Foreign key constraints
- Check constraints
- Unique constraints
- Not null constraints
- Validation rules

### Performance
- Partitioning strategy
- Vacuum scheduling
- Index optimization
- Query optimization
- Connection pooling 