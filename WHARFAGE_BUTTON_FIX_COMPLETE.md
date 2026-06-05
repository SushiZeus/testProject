# Wharfage Button Visibility Fix - Complete

## Issue Fixed
When tax documents were uploaded for SEA shipments, the wharfage upload button disappeared.

## Root Cause
Button visibility logic had wharfage upload only in assessment phase, not payment phase.

## Solution
Added upload buttons (tax and wharfage) to payment phase section in DeclarationPage.tsx.

## Result
✅ Wharfage upload button now always visible for SEA shipments during payment phases
✅ Tax and wharfage remain completely independent
✅ Both upload and payment buttons work correctly

## Status: COMPLETE