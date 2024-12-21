# Documentation Synchronization

## Current Inconsistencies

### 1. File Structure Differences

| Document | Structure | Status | Action Needed |
|----------|-----------|---------|---------------|
| APP_STRUCTURE.md | Mixed src/ and root structure | ❌ Outdated | Update to new App Router structure |
| REGIONAL_STRUCTURE.md | Feature-based regional structure | ✅ Current | Minor updates needed |
| TECHNICAL_SPECS.md | New App Router structure | ✅ Current | None |
| ARCHITECTURE.md | Old structure with src/ | ❌ Outdated | Update to new structure |

### 2. Files to Move

#### Current Location → New Location
```bash
# Components
src/components/bed-management/* → app/(features)/bed-management/components/*

# Hooks
src/hooks/* → app/(features)/[feature]/hooks/* or hooks/* (shared)

# API
src/lib/api/* → app/api/* (routes) or lib/api/* (utilities)

# Types
src/types/* → types/* (shared) or app/(features)/[feature]/types/* (feature-specific)
```

### 3. Technical Stack Alignment

| Technology | Current Status | Action Needed |
|------------|---------------|---------------|
| UI Framework | Mixed Material UI/shadcn | Remove Material UI, standardize on shadcn |
| State Management | Mixed approaches | Standardize on TanStack Query + React Context |
| API Layer | REST + tRPC mentions | Standardize on tRPC |
| Styling | Tailwind CSS | ✅ Consistent |

## Required Updates

### 1. APP_STRUCTURE.md
- Remove src/ directory references
- Update to App Router structure
- Add feature-specific organization
- Update component structure

### 2. REGIONAL_STRUCTURE.md
- Update paths to match App Router
- Add tRPC integration
- Update component examples
- Add regional route handling

### 3. TECHNICAL_SPECS.md
- ✅ Already aligned with new structure
- Add more detailed regional support
- Add tRPC type examples
- Add shadcn/ui setup

### 4. ARCHITECTURE.md
- Complete rewrite needed
- Update to App Router patterns
- Add tRPC architecture
- Update data flow diagrams

## Action Plan

1. **Structure Updates**
   - Finalize App Router structure
   - Document feature organization
   - Update all path references
   - Add route group examples

2. **Technical Alignment**
   - Remove Material UI references
   - Add shadcn/ui setup guide
   - Update state management docs
   - Standardize API approach

3. **Regional Support**
   - Update regional implementation
   - Add route group examples
   - Document regional providers
   - Add compliance checks

4. **Documentation Updates**
   - Update all file paths
   - Add new examples
   - Update configuration files
   - Add migration guide

## Final Structure (To be implemented)

```bash
write-care-notes/
├── app/                              # Next.js App Router
│   ├── (auth)/                      # Auth routes
│   ├── (dashboard)/                 # Dashboard routes
│   ├── (features)/                  # Feature routes
│   │   └── [feature]/
│   │       ├── components/          # Feature components
│   │       ├── hooks/              # Feature hooks
│   │       ├── types/              # Feature types
│   │       └── utils/              # Feature utilities
│   └── api/                         # API routes
├── components/                      # Shared components
├── hooks/                          # Shared hooks
├── lib/                            # Core utilities
├── providers/                      # Shared providers
├── types/                          # Shared types
└── config/                         # Configuration
```

## Next Steps

1. Update APP_STRUCTURE.md with new structure
2. Update REGIONAL_STRUCTURE.md with new patterns
3. Review and update TECHNICAL_SPECS.md
4. Rewrite ARCHITECTURE.md
5. Create migration guide for existing code
6. Update all code examples
7. Add new configuration examples
8. Update CI/CD documentation

## Migration Priority

1. **High Priority**
   - File structure updates
   - Technical stack alignment
   - Regional implementation

2. **Medium Priority**
   - Documentation updates
   - Example updates
   - Configuration files

3. **Low Priority**
   - Optional features
   - Advanced patterns
   - Performance optimizations
``` 