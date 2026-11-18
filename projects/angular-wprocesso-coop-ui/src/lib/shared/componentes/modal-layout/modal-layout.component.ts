import { Component } from '@angular/core';

/**
 * Layout padrão para modais abertos via DialogService (DynamicDialog).
 *
 * O wrapper já aplica `padding: 1rem` (p-3) na área do body e a linha
 * separadora + espaço no footer. Consumers NÃO devem adicionar padding
 * próprio no elemento raiz do slot, só definir estrutura interna
 * (`flex flex-column gap-2`, `formgrid grid`, etc.).
 *
 * Slots disponíveis:
 *
 * [steps]: (opcional) Indicador de etapas fixo acima do body, não scrolla.
 *
 *   <div steps class="flex align-items-center px-3 py-3 border-bottom-1 surface-border">
 *     <!-- indicador customizado de etapas -->
 *   </div>
 *
 * [body]: Conteúdo principal, área rolável.
 *
 *   <div body class="flex flex-column gap-2">...</div>
 *   <form body [formGroup]="formulario" class="p-fluid" autocomplete="off">...</form>
 *
 * [footer]: Dois slots (esquerda e direita via justify-content: space-between).
 *
 *   <span footer><!-- botão esquerdo, ex: Cancelar --></span>
 *   <span footer class="flex gap-2"><!-- botões direita, ex: Salvar --></span>
 *
 * Uso com DialogService:
 *   this.dialogService.open(MinhaModalComponent, {
 *     ...DIALOG_CONFIG.md,
 *     header: 'Título da Modal',
 *     data: { ... },
 *   });
 *
 * Tamanhos: xs | sm | md | lg | xlg | full (DIALOG_CONFIG).
 * Sub-modais (abertos de dentro de outro DynamicDialog): baseZIndex: 10001.
 */
@Component({
  selector: 'app-modal-layout',
  templateUrl: './modal-layout.component.html',
  styleUrl: './modal-layout.component.css',
})
export class ModalLayoutComponent {}
