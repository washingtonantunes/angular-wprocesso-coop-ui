import { makeEnvironmentProviders, InjectionToken } from '@angular/core';

import { ApiConfiguration as CadastroApiConfiguration } from './shared/services/cadastro/api/api-configuration';
import { ApiConfiguration as SegurancaApiConfiguration } from './shared/services/seguranca/api/api-configuration';

export type TipoParticipante = 'CENTRAL' | 'COOPERATIVA';

export interface CoopUiConfig {
  grupo: TipoParticipante;
  tipo: TipoParticipante;
  participante: string;
  backendSeguranca: string;
  backendCadastro: string;
}

export const COOP_UI_CONFIG = new InjectionToken<CoopUiConfig>('COOP_UI_CONFIG');

export function provideCoopUi(config: CoopUiConfig) {
  return makeEnvironmentProviders([
    { provide: COOP_UI_CONFIG, useValue: config },
    { provide: SegurancaApiConfiguration, useValue: { rootUrl: config.backendSeguranca } },
    { provide: CadastroApiConfiguration, useValue: { rootUrl: config.backendCadastro } },
  ]);
}
