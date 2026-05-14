import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from '@angular/core';
import * as React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type StockChartDatum = {
  name: string;
  value: number;
  color: string;
};

const ResponsiveContainerComponent = ResponsiveContainer as unknown as React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>;
const PieChartComponent = PieChart as unknown as React.ComponentType<Record<string, unknown>>;
const PieComponent = Pie as unknown as React.ComponentType<Record<string, unknown>>;
const BarChartComponent = BarChart as unknown as React.ComponentType<Record<string, unknown>>;
const BarComponent = Bar as unknown as React.ComponentType<Record<string, unknown>>;
const CartesianGridComponent = CartesianGrid as unknown as React.ComponentType<Record<string, unknown>>;
const CellComponent = Cell as unknown as React.ComponentType<Record<string, unknown>>;
const TooltipComponent = Tooltip as unknown as React.ComponentType<Record<string, unknown>>;
const LegendComponent = Legend as unknown as React.ComponentType<Record<string, unknown>>;
const XAxisComponent = XAxis as unknown as React.ComponentType<Record<string, unknown>>;
const YAxisComponent = YAxis as unknown as React.ComponentType<Record<string, unknown>>;

type ChartView = 'pie' | 'bar';

const panelStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  padding: '24px',
};

const headerStyle: React.CSSProperties = {
  alignItems: 'flex-start',
  display: 'flex',
  gap: '16px',
  justifyContent: 'space-between',
  marginBottom: '20px',
};

const eyebrowStyle: React.CSSProperties = {
  color: '#777777',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '6px 0 0',
};

const badgeStyle: React.CSSProperties = {
  background: 'rgba(102, 126, 234, 0.12)',
  borderRadius: '999px',
  color: '#4c5bd4',
  fontSize: '12px',
  fontWeight: 700,
  padding: '8px 12px',
  whiteSpace: 'nowrap',
};

const layoutStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'grid',
  gap: '24px',
  gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(240px, 0.9fr)',
};

const summaryCardStyle: React.CSSProperties = {
  background: '#f8faff',
  border: '1px solid #e8ecff',
  borderRadius: '16px',
  display: 'grid',
  gap: '8px',
  marginTop: '18px',
  padding: '16px 18px',
};

const legendRowStyle: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
};

const legendToplineStyle: React.CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  fontSize: '14px',
  gap: '12px',
  justifyContent: 'space-between',
};

const barTrackStyle: React.CSSProperties = {
  background: '#edf1f7',
  borderRadius: '999px',
  height: '10px',
  overflow: 'hidden',
  width: '100%',
};

const tabsStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: '8px',
  marginBottom: '18px',
  padding: '4px',
  background: '#f3f6fb',
  borderRadius: '999px',
};

function formatTooltip(value: unknown, name: unknown): [string, string] {
  const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
  const label = typeof name === 'string' ? name : String(name ?? 'Categoria');

  return [`${numericValue} unidades`, label];
}

function StockChartPanel(props: {
  data: StockChartDatum[];
  title: string;
  subtitle: string;
  totalLabel: string;
}): React.ReactElement {
  const { data, title, subtitle, totalLabel } = props;
  const [activeView, setActiveView] = React.useState<ChartView>('pie');

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const leader = data.reduce<StockChartDatum | null>((currentLeader, item) => {
    if (!currentLeader || item.value > currentLeader.value) {
      return item;
    }

    return currentLeader;
  }, null);

  const sortedData = [...data].sort((left, right) => right.value - left.value);

  return React.createElement(
    'section',
    { style: panelStyle },
    React.createElement(
      'div',
      { style: headerStyle },
      React.createElement(
        'div',
        null,
        React.createElement('h3', { style: { color: '#333333', fontSize: '18px', margin: 0 } }, title),
        React.createElement('p', { style: eyebrowStyle }, subtitle)
      ),
      leader
        ? React.createElement('span', { style: badgeStyle }, `Mayor stock: ${leader.name}`)
        : null
    ),
    React.createElement(
      'div',
      { style: tabsStyle },
      (['pie', 'bar'] as ChartView[]).map((view) => {
        const isActive = activeView === view;
        const label = view === 'pie' ? 'Donut' : 'Barras';

        return React.createElement(
          'button',
          {
            key: view,
            type: 'button',
            onClick: () => setActiveView(view),
            style: {
              background: isActive ? '#5b6cff' : 'transparent',
              border: 'none',
              borderRadius: '999px',
              color: isActive ? '#ffffff' : '#425466',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 16px',
              transition: 'all 0.2s ease',
            },
          },
          label
        );
      })
    ),
    React.createElement(
      'div',
      { style: layoutStyle },
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { height: '320px', width: '100%' } },
          React.createElement(
            ResponsiveContainerComponent,
            { width: '100%', height: '100%' },
            activeView === 'pie'
              ? React.createElement(
                  PieChartComponent,
                  null,
                  React.createElement(PieComponent, {
                    data,
                    dataKey: 'value',
                    nameKey: 'name',
                    cx: '50%',
                    cy: '50%',
                    innerRadius: 72,
                    outerRadius: 112,
                    paddingAngle: 4,
                    stroke: '#ffffff',
                    strokeWidth: 4,
                  }, data.map((item) => React.createElement(CellComponent, { key: item.name, fill: item.color }))),
                  React.createElement(TooltipComponent, {
                    formatter: formatTooltip,
                    contentStyle: {
                      border: '1px solid #e4e7ec',
                      borderRadius: '12px',
                      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                    },
                  }),
                  React.createElement(LegendComponent, { verticalAlign: 'bottom', wrapperStyle: { fontSize: '13px', paddingTop: '10px' } })
                )
              : React.createElement(
                  BarChartComponent,
                  { data: sortedData, margin: { top: 10, right: 12, left: -10, bottom: 8 } },
                  React.createElement(CartesianGridComponent, { stroke: '#eef2f7', vertical: false }),
                  React.createElement(XAxisComponent, {
                    dataKey: 'name',
                    tick: { fill: '#667085', fontSize: 12 },
                    tickLine: false,
                    axisLine: false,
                  }),
                  React.createElement(YAxisComponent, {
                    tick: { fill: '#667085', fontSize: 12 },
                    tickLine: false,
                    axisLine: false,
                    allowDecimals: false,
                  }),
                  React.createElement(TooltipComponent, {
                    formatter: formatTooltip,
                    contentStyle: {
                      border: '1px solid #e4e7ec',
                      borderRadius: '12px',
                      boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
                    },
                  }),
                  React.createElement(BarComponent, {
                    dataKey: 'value',
                    radius: [10, 10, 0, 0],
                  }, sortedData.map((item) => React.createElement(CellComponent, { key: item.name, fill: item.color })))
                )
          )
        ),
        React.createElement(
          'div',
          { style: summaryCardStyle },
          React.createElement('span', { style: { color: '#7a7f8a', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' } }, totalLabel),
          React.createElement('strong', { style: { color: '#222222', fontSize: '34px', lineHeight: '1' } }, total),
          React.createElement('span', { style: { color: '#5f6673', fontSize: '14px' } }, activeView === 'pie' ? 'Unidades distribuidas entre las categorias activas' : 'Comparativo directo del stock disponible por categoria')
        )
      ),
      React.createElement(
        'div',
        { style: { display: 'grid', gap: '16px' } },
        sortedData.map((item) => {
          const percentage = total ? Math.round((item.value / total) * 100) : 0;

          return React.createElement(
            'div',
            { key: item.name, style: legendRowStyle },
            React.createElement(
              'div',
              { style: legendToplineStyle },
              React.createElement(
                'span',
                { style: { alignItems: 'center', display: 'inline-flex', gap: '10px', fontWeight: 600 } },
                React.createElement('span', {
                  style: {
                    background: item.color,
                    borderRadius: '50%',
                    display: 'inline-block',
                    height: '12px',
                    width: '12px',
                  },
                }),
                item.name
              ),
              React.createElement('strong', null, `${item.value} uds`)
            ),
            React.createElement(
              'div',
              { style: barTrackStyle },
              React.createElement('div', {
                style: {
                  background: item.color,
                  borderRadius: 'inherit',
                  height: '100%',
                  transition: 'width 0.35s ease',
                  width: `${percentage}%`,
                },
              })
            ),
            React.createElement('span', { style: { color: '#6b7280', fontSize: '12px', fontWeight: 700, justifySelf: 'end' } }, `${percentage}%`)
          );
        })
      )
    )
  );
}

@Component({
  selector: 'app-admin-stock-chart',
  standalone: true,
  template: '<div class="chart-host" #chartHost></div>',
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .chart-host {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStockChartComponent implements AfterViewInit, OnDestroy {
  readonly data = input.required<StockChartDatum[]>();
  readonly title = input('Distribucion de stock');
  readonly subtitle = input('Participacion por categoria en el inventario actual.');
  readonly totalLabel = input('Stock total');

  private readonly chartHost = viewChild.required<ElementRef<HTMLDivElement>>('chartHost');
  private root: Root | null = null;

  constructor() {
    effect(() => {
      const data = this.data();
      const title = this.title();
      const subtitle = this.subtitle();
      const totalLabel = this.totalLabel();

      if (this.root) {
        this.renderChart(data, title, subtitle, totalLabel);
      }
    });
  }

  ngAfterViewInit(): void {
    this.root = createRoot(this.chartHost().nativeElement);
    this.renderChart(this.data(), this.title(), this.subtitle(), this.totalLabel());
  }

  ngOnDestroy(): void {
    this.root?.unmount();
  }

  private renderChart(data: StockChartDatum[], title: string, subtitle: string, totalLabel: string): void {
    if (!this.root) {
      return;
    }

    this.root.render(React.createElement(StockChartPanel, { data, title, subtitle, totalLabel }));
  }
}