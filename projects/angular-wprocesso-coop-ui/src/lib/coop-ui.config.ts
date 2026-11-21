import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { ApiConfiguration as SegurancaApiConfiguration } from './shared/services/seguranca/api/api-configuration';

export type TipoParticipante = 'CENTRAL' | 'COOPERATIVA';

export interface CoopUiConfig {
  grupo: TipoParticipante;
  tipo: TipoParticipante;
  participante: string;
  backendSeguranca: string;
}

export const COOP_UI_CONFIG = new InjectionToken<CoopUiConfig>('COOP_UI_CONFIG');

export function provideCoopUi(config: CoopUiConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: COOP_UI_CONFIG, useValue: config },
    { provide: SegurancaApiConfiguration, useValue: { rootUrl: config.backendSeguranca } },
  ]);
}
