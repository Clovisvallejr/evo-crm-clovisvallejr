#!/bin/bash

# Remover imports não utilizados - ItemsTable.tsx
sed -i "s/import { useState, useEffect, useMemo }/import { useMemo }/" src/components/shared/ItemsTable.tsx
sed -i "s/import { Trash2, GripVertical }/import { Trash2 }/" src/components/shared/ItemsTable.tsx

# Remover imports não utilizados - OrderPreviewModal.tsx
sed -i "s/import React from 'react';//" src/components/shared/OrderPreviewModal.tsx
sed -i "s/, X//" src/components/shared/OrderPreviewModal.tsx

# Remover imports não utilizados - OrderTemplate.tsx
sed -i "s/import React from 'react';//" src/components/shared/OrderTemplate.tsx

# Remover imports não utilizados - ProductSelector.tsx
sed -i "s/import React from 'react';//" src/components/shared/ProductSelector.tsx
sed -i "s/, Button//" src/components/shared/ProductSelector.tsx

# Remover imports não utilizados - QuotePreviewModal.tsx
sed -i "s/import React from 'react';//" src/components/shared/QuotePreviewModal.tsx
sed -i "s/, X//" src/components/shared/QuotePreviewModal.tsx

# Remover imports não utilizados - QuoteTemplate.tsx
sed -i "s/import React from 'react';//" src/components/shared/QuoteTemplate.tsx

# Remover imports não utilizados - ToastContainer.tsx
sed -i "s/import React from 'react';//" src/components/Toast/ToastContainer.tsx

echo "✅ Imports corrigidos!"
