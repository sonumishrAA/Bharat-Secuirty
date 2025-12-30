import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

export function provideShared(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // future shared providers:
    // icons
    // theme config
    // UI utilities
  ]);
}
