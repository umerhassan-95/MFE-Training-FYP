import React, { Suspense } from 'react';
import { ErrorBoundary, Loader } from '@meridian/shared-ui';

export function RemoteLoader({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="ui-error ui-card">
          <h2>Unable to load module</h2>
          <p>The {label} remote is unavailable. Keep the shell running and restart that MFE independently.</p>
        </div>
      }
    >
      <Suspense fallback={<Loader label={`Loading ${label}…`} />}>{children}</Suspense>
    </ErrorBoundary>
  );
}
