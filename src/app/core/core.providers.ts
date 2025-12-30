import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // future global providers
    // analytics, error tracking, etc.
  ]);
}
