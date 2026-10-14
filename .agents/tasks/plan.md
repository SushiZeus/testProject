# Implementation Plan: Authorization Letters Upload Step

## Overview
Add an Authorization Letter upload step to FileOpeningPage.tsx that appears after step 2 (Documents & Numbers) and before SEA Freight Details (step 3). The requirements vary by transport mode:
- **AIR**: 3 letters (Swissport, Customs, TBS)
- **SEA**: 3 letters (Shipping Line, Customs, TBS)
- **ROAD/RAIL**: 2 letters (Customs, TBS)

## Current File Structure Analysis

**State declarations location:** Lines 63-127
- Client state, shipment state, documents state, document numbers, sea freight details, cargo description

**Helper functions location:** Lines 207-244
- `handleDocumentToggle`, `handleFileUpload`, `removeUploadedFile`

**Validation function:** Lines 246-355
- `validateStep()` with switch cases for steps 1-5

**Submit handler:** Lines 357-474
- `handleSubmit()` builds document array and creates file

**Render functions location:** Lines 543-1393
- `renderStep1()`, `renderStep2()`, `renderStep3()`, `renderStep4()`, `renderStep5()`, `renderStep6()`

**Step configuration:** Lines 1451-1469
- `getSteps()` dynamically builds step array, inserting SEA step conditionally

**Main return/rendering logic:** Lines 1523-1535
- Conditional rendering based on step number and transport mode

## Implementation Steps

- [ ] 1. **Add Authorization Letter state declarations**
      - Location: After line 127 (after `cargoDescription` state)
      - Add state for uploaded authorization letters (similar to `uploadedFiles` pattern)
      - State shape: `Record<string, File | null>` for each letter type
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` in app directory - TypeScript compiles without errors

- [ ] 2. **Add Authorization Letter file input refs**
      - Location: After line 138 (after `fileInputRefs` declaration)
      - Add refs for authorization letter file inputs (similar to `fileInputRefs`)
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - TypeScript compiles without errors

- [ ] 3. **Create helper functions for authorization letters**
      - Location: After line 244 (after `removeUploadedFile` function)
      - Add `handleAuthLetterUpload(letterType: string, files: FileList | null)` - validates PDF only, stores single file per type
      - Add `removeAuthLetter(letterType: string)` - clears the file for that type
      - Add `getRequiredAuthLetters()` - returns array of required letter types based on `transportMode`
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - no TypeScript errors

- [ ] 4. **Update validateStep function - add case 3**
      - Location: Lines 246-355, inside the switch statement
      - Insert new case 3 BEFORE the existing case 3 (which becomes case 4)
      - Validation logic: Loop through `getRequiredAuthLetters()`, verify each has an uploaded file, set validation errors for missing files, show toast with count of missing letters
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - compiles successfully

- [ ] 5. **Update validateStep function - renumber existing cases**
      - Location: Lines 246-355
      - Current case 3 (SEA freight) becomes case 4
      - Current case 4 (cargo description) becomes case 5
      - Current case 5 (documents upload) becomes case 6
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - compiles successfully

- [ ] 6. **Create renderAuthorizationLettersStep function**
      - Location: After line 1173 (after `renderStep2` function, before `renderStep3`)
      - Function signature: `const renderAuthorizationLettersStep = () => { ... }`
      - Returns JSX with:
        - Title: "Authorization Letters"
        - Description explaining requirements by transport mode
        - Loop through `getRequiredAuthLetters()` to render a Card for each letter type
        - Each Card: letter name, file upload button (hidden input + visible Button with Upload icon), display selected file name and size when uploaded, remove button (X icon) when file exists, red border when `validationErrors[letterType]` is true
        - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - no TypeScript errors

- [ ] 7. **Update getSteps function - insert Authorization Letters step**
      - Location: Lines 1451-1469
      - Current logic: step 1, step 2, then conditionally adds SEA step, then adds cargo/docs/confirmation
      - New logic: step 1, step 2, step 3 (Authorization Letters), then conditionally SEA step (becomes 4), then cargo (becomes 4 or 5), docs (becomes 5 or 6), confirmation (becomes 6 or 7)
      - Update step numbers in the baseSteps array after Authorization Letters insertion
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - compiles successfully

- [ ] 8. **Update handleSubmit - include authorization letters in documents array**
      - Location: Lines 357-474, specifically around line 387 where documents array is built
      - After the existing documents loop, add another loop for authorization letters
      - Map uploaded auth letters to document format: `{ type: 'authorization_letter', name: file.name + ' - ' + letterType, url: URL.createObjectURL(file) }`
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - compiles successfully

- [ ] 9. **Update main render logic - insert authorization letters step rendering**
      - Location: Lines 1523-1535 (inside the Card > CardContent)
      - Current structure renders steps conditionally based on step number and transport mode
      - Insert: `{step === 3 && renderAuthorizationLettersStep()}`
      - Update existing conditionals:
        - Old `step === 3` becomes `step === 4` (SEA freight or cargo description)
        - Old `step === 4` becomes `step === 5` (cargo description or document upload)
        - Old `step === 5` becomes `step === 6` (document upload or confirmation)
        - Old `step === 6` becomes `step === 7` (confirmation)
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - compiles without errors

- [ ] 10. **Update form reset logic - clear authorization letters**
      - Location: Lines 1422-1433 (inside the "Create Another File" button onClick handler in `renderStep6`)
      - Add line to reset authorization letters state back to empty object
      - Files: `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx`
      - Verify: `npm run build` - compiles successfully

- [ ] 11. **Add authorization_letter to DocumentType if needed**
      - Location: Check if DocumentType includes 'authorization_letter', if not it needs to be added to the type definition
      - Check: `c:\Users\user\Desktop\testproject\app\src\types\index.ts` or wherever DocumentType is defined
      - If missing, add 'authorization_letter' to the DocumentType union
      - Files: `c:\Users\user\Desktop\testproject\app\src\types\index.ts` (or equivalent)
      - Verify: `npm run build` - TypeScript compiles without type errors

- [ ] 12. **Full system test - build and run**
      - Run: `cd c:\Users\user\Desktop\testproject\app && npm run build`
      - Expected: Build succeeds with no errors
      - Run: `npm run preview` to start the dev server
      - Manual verification steps:
        1. Navigate to http://localhost:5173/
        2. Login as documentation_officer@company.com / documentation_officer123
        3. Go to File Opening page
        4. Complete step 1 (Client & Shipment) with AIR transport
        5. Complete step 2 (Documents & Numbers)
        6. Verify step 3 shows "Authorization Letters" with 3 required letters (Swissport, Customs, TBS)
        7. Try to proceed without uploading - should show validation error
        8. Upload PDF files for all 3 letters
        9. Proceed to next step successfully
        10. Complete the file creation
        11. Repeat for SEA (should show Shipping Line, Customs, TBS)
        12. Repeat for ROAD (should show Customs, TBS only)
      - Files: All FileOpeningPage.tsx changes
      - Verify: Manual testing confirms step appears, validation works, files upload, and form submits successfully

## Key Design Decisions

**Decision 1: Step insertion position**
- Rationale: Requirements state "AFTER step 2 (Documents & Numbers) and BEFORE the SEA Freight / Cargo Description steps". Currently step 2 is Documents & Numbers, step 3 is SEA Freight (conditional), step 4 is Cargo Description. Inserting at position 3 pushes everything else down by 1.

**Decision 2: State structure for authorization letters**
- Rationale: Using `Record<string, File | null>` keyed by letter type (e.g., 'swissport', 'customs', 'tbs', 'shipping_line') allows easy lookup and validation. Alternative considered: array of objects, but keyed record provides O(1) access and simpler validation.

**Decision 3: Dynamic letter requirements via getRequiredAuthLetters()**
- Rationale: Centralizes the logic for which letters are required based on transport mode. Makes validation and rendering consistent. Returns array of objects: `{ key: string, label: string }[]`.

**Decision 4: File upload pattern consistency**
- Rationale: Following the existing `handleFileUpload` pattern for consistency. Each letter type gets one file (not multiple like other documents), using single File | null instead of File[].

**Decision 5: Document type in handleSubmit**
- Rationale: Authorization letters will be stored with type 'authorization_letter' and the specific letter type appended to the name (e.g., "auth-letter.pdf - Swissport Authorization") for clear identification in the system.

**Decision 6: Validation error display**
- Rationale: Following existing pattern - red border on Card when validation error exists, toast message showing count of missing files, individual error indicators per letter type.

## Files Modified

1. `c:\Users\user\Desktop\testproject\app\src\pages\FileOpeningPage.tsx` - Main implementation file (all steps)
2. `c:\Users\user\Desktop\testproject\app\src\types\index.ts` - Potentially add 'authorization_letter' to DocumentType union (step 11, if needed)

## Verification Commands

- **Build verification**: `cd c:\Users\user\Desktop\testproject\app && npm run build`
- **Type check**: Build command includes `tsc -b` which checks TypeScript
- **Runtime verification**: `npm run preview` and manual testing as described in step 12

## Dependencies

- No new dependencies required
- Uses existing components: Card, CardContent, Button, Input, Label, Badge
- Uses existing icons: Upload, X, FileText from lucide-react
- Uses existing utilities: cn, toast

## Notes

- The step numbering is dynamic based on transport mode (SEA adds extra step)
- After inserting Authorization Letters at step 3, SEA freight moves to step 4, cargo to step 5, documents to step 6, confirmation to step 7 (for SEA transport)
- For non-SEA transport: Auth letters step 3, cargo step 4, documents step 5, confirmation step 6
- The getSteps() function handles this dynamic numbering by building the steps array conditionally
- All validation must pass before proceeding to next step
- Only PDF files allowed (matching existing document upload constraints)
