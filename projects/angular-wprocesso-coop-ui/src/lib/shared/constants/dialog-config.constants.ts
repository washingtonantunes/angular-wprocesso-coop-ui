import { DynamicDialogConfig } from 'primeng/dynamicdialog';

const BASE_CONTENT_STYLE = { overflow: 'hidden', padding: '0', height: '100%' };

const BASE: Partial<DynamicDialogConfig> = {
  modal: true,
  resizable: false,
  draggable: false,
  closable: true,
  baseZIndex: 10000,
  contentStyle: BASE_CONTENT_STYLE,
};

export const DIALOG_CONFIG = {
  xs: { ...BASE, width: '25vw', style: { height: 'clamp(220px, 48vh, 350px)' } },
  sm: { ...BASE, width: '30vw', style: { height: 'clamp(250px, 58vh, 450px)' } },
  md: { ...BASE, width: '40vw', style: { height: 'clamp(300px, 63vh, 500px)' } },
  lg: { ...BASE, width: '50vw', style: { height: 'clamp(350px, 68vh, 550px)' } },
  xlg: { ...BASE, width: '80vw', style: { height: 'clamp(500px, 82vh, 750px)' } },
  full: { ...BASE, width: '100vw', style: { height: '100vh' } },
} satisfies Record<string, Partial<DynamicDialogConfig>>;
