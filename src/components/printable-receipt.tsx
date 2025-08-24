'use client';

import React from 'react';

// A minimal version of the props, though they won't be used in this simplified component.
type PrintableReceiptProps = {
    [key: string]: any; // Accept any props to avoid breaking the parent
};

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>((props, ref) => {
    // Render a very simple, static component to test the printing mechanism itself.
    // This component has no dependencies on props, hooks, or external assets.
    return (
        <div ref={ref} style={{ padding: '20px', color: 'black', backgroundColor: 'white' }}>
            <h1>Print Test</h1>
            <p>If you can see this, the printing mechanism is working.</p>
        </div>
    );
});

PrintableReceipt.displayName = 'PrintableReceipt';
