/**
 * Local IndexedDB database using Dexie.
 * Adheres strictly to TRD Section 4 data model and seed rules.
 */

import Dexie, { type Table } from 'dexie';

// Common metadata fields
export interface BaseEntity {
  id: string;
  org_id?: string;
  created_at: string;
  client_updated_at: string;
  server_updated_at?: string;
  deleted_at?: string | null;
  device_id?: string;
  _dirty?: number; // 1 = dirty/pending sync, 0 = synced
}

export interface CompanyEntity extends BaseEntity {
  name: string;
  brand_code: string;
  logo_data_url?: string;
  primary_color: string;
  accent_color: string;
  watermark_text?: string;
  watermark_opacity?: number;
  header_text?: string;
  footer_text?: string;
  address?: string;
  phone?: string;
  email?: string;
  signatory_name?: string;
  signatory_title?: string;
  default_terms?: string[];
  default_currency: string;
  ref_pattern: string;
}

export interface ClientEntity extends BaseEntity {
  name: string;
  attention?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  industry?: string;
  tax_no?: string;
  status: 'lead' | 'customer' | 'inactive';
}

export interface ContactEntity extends BaseEntity {
  client_id: string;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
}

export interface SiteEntity extends BaseEntity {
  client_id: string;
  name: string;
  address?: string;
  source_type?: string;
}

export interface WaterAnalysisEntity extends BaseEntity {
  site_id: string;
  test_date: string;
  tds?: number;
  ph?: number;
  hardness?: number;
  turbidity?: number;
  iron?: number;
  silica?: number;
  sdi?: number;
}

export interface ComponentCategoryEntity extends BaseEntity {
  name: string;
  sort_order: number;
}

export interface ComponentSpecField {
  label: string;
  value: string;
  unit?: string;
}

export interface ComponentEntity extends BaseEntity {
  category_id: string;
  name: string;
  specs: ComponentSpecField[];
  cost_minor?: number;
  archived?: boolean;
}

export interface TemplateEntity extends BaseEntity {
  name: string;
  description?: string;
  plant_type: string;
  default_capacity_gpd: number;
  default_intro?: string;
}

export interface TemplateItemEntity extends BaseEntity {
  template_id: string;
  component_id: string;
  name: string;
  qty: number;
  sort_order: number;
  specs?: ComponentSpecField[];
}

export interface ProposalEntity extends BaseEntity {
  company_id: string;
  client_id?: string;
  contact_id?: string;
  site_id?: string;
  client_snapshot: {
    client_name: string;
    attention?: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  ref_base: string;
  rev: number;
  status: 'draft' | 'sent' | 'follow_up' | 'won' | 'lost' | 'on_hold' | 'expired' | 'superseded';
  title: string;
  design: {
    feed_flow: number;
    feed_unit: 'GPD' | 'm3h';
    recovery_pct: number;
    design_tds_ppm?: number;
    product_tds_ppm?: number;
    inlet_pressure_bar?: number;
    temperature_c?: number;
  };
  currency: string;
  fx_rate?: number;
  price_mode: 'lump' | 'grouped' | 'itemized';
  lump_amount_minor?: number;
  tax_lines?: any[];
  payment_terms?: { label: string; percent: number; amount?: number }[];
  delivery_text?: string;
  validity_days?: number;
  sent_at?: string;
  next_follow_up?: string;
  won_po_no?: string;
  won_value_minor?: number;
  lost_reason?: string;
}

export interface ProposalItemEntity extends BaseEntity {
  proposal_id: string;
  source_component_id?: string;
  name: string;
  qty: number;
  sort_order: number;
  specs: ComponentSpecField[];
  unit_price_minor?: number;
}

export interface ProposalCalcEntity extends BaseEntity {
  proposal_id: string;
  kind: 'multimedia' | 'cartridge' | 'ro_flow';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

// Rule tables
export interface RuleSettingEntity {
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}

export interface MediaCatalogEntity {
  id: string;
  name: string;
  bulk_density_kg_m3: number;
  rate_minor_per_kg: number;
  default_depth_mm: number;
  sort_order: number;
}

export interface VesselSizeEntity {
  id: string;
  diameter_in: number;
  diameter_mm: number;
  default_height_mm: number;
  max_pressure_bar: number;
  type: 'frp' | 'ms';
}

export interface CartridgeTypeEntity {
  id: string;
  length_in: number;
  micron: number;
  form: 'slim' | 'jumbo';
  ideal_flow_m3h: number;
}

export interface HousingTypeEntity {
  id: string;
  form: 'slim' | 'jumbo';
  length_in: number;
  slots: number;
  material: 'PVC' | 'SS304' | 'SS316' | 'FRP';
}

export interface OutboxEntity {
  id: string;
  table_name: string;
  row_id: string;
  action: 'insert' | 'update' | 'delete';
  payload: any;
  created_at: string;
}

export class AppDatabase extends Dexie {
  companies!: Table<CompanyEntity>;
  clients!: Table<ClientEntity>;
  contacts!: Table<ContactEntity>;
  sites!: Table<SiteEntity>;
  water_analyses!: Table<WaterAnalysisEntity>;
  component_categories!: Table<ComponentCategoryEntity>;
  components!: Table<ComponentEntity>;
  templates!: Table<TemplateEntity>;
  template_items!: Table<TemplateItemEntity>;
  proposals!: Table<ProposalEntity>;
  proposal_items!: Table<ProposalItemEntity>;
  proposal_calcs!: Table<ProposalCalcEntity>;
  rule_settings!: Table<RuleSettingEntity, string>;
  media_catalog!: Table<MediaCatalogEntity>;
  vessel_sizes!: Table<VesselSizeEntity>;
  cartridge_types!: Table<CartridgeTypeEntity>;
  housing_types!: Table<HousingTypeEntity>;
  outbox!: Table<OutboxEntity>;

  constructor() {
    super('ROProposalStudioDB');

    this.version(1).stores({
      companies: 'id, brand_code, _dirty',
      clients: 'id, name, status, _dirty',
      contacts: 'id, client_id, is_primary, _dirty',
      sites: 'id, client_id, _dirty',
      water_analyses: 'id, site_id, _dirty',
      component_categories: 'id, sort_order, _dirty',
      components: 'id, category_id, name, archived, _dirty',
      templates: 'id, name, plant_type, _dirty',
      template_items: 'id, template_id, component_id, sort_order, _dirty',
      proposals: 'id, company_id, client_id, ref_base, status, created_at, _dirty',
      proposal_items: 'id, proposal_id, sort_order, _dirty',
      proposal_calcs: 'id, proposal_id, kind, _dirty',
      rule_settings: 'key',
      media_catalog: 'id, name, sort_order',
      vessel_sizes: 'id, diameter_in, diameter_mm, type',
      cartridge_types: 'id, length_in, micron, form',
      housing_types: 'id, form, length_in, slots',
      outbox: 'id, table_name, row_id, created_at',
    });
  }
}

export const db = new AppDatabase();

/**
 * Initializes and seeds default rules, catalog items, templates, and company if database is empty.
 */
export async function initAndSeedDatabase(): Promise<void> {
  const now = new Date().toISOString();

  // 1. Seed Rule Settings if empty
  const settingsCount = await db.rule_settings.count();
  if (settingsCount === 0) {
    await db.rule_settings.bulkPut([
      {
        key: 'max_frp_diameter_mm',
        value: 1600,
        description: 'Maximum allowable FRP vessel diameter before Mild Steel is recommended',
        updated_at: now,
      },
      {
        key: 'max_frp_pressure_bar',
        value: 10.0,
        description: 'Maximum allowable operating pressure for FRP vessels in Bar(g)',
        updated_at: now,
      },
      {
        key: 'max_frp_temp_c',
        value: 49.0,
        description: 'Maximum allowable operating temperature for FRP resin in Celsius',
        updated_at: now,
      },
      {
        key: 'default_velocity_m_h',
        value: 16.0,
        description: 'Standard multimedia filtration design velocity in m/hr',
        updated_at: now,
      },
      {
        key: 'min_freeboard_pct',
        value: 40.0,
        description: 'Minimum recommended freeboard height above media bed (%)',
        updated_at: now,
      },
      {
        key: 'cartridge_safety_margin_pct',
        value: 20.0,
        description: 'Default safety margin percentage for cartridge filter sizing',
        updated_at: now,
      },
    ]);
  }

  // 2. Seed Standard Vessel Sizes if empty
  const vesselCount = await db.vessel_sizes.count();
  if (vesselCount === 0) {
    await db.vessel_sizes.bulkPut([
      { id: 'v-0844', diameter_in: 8, diameter_mm: 200, default_height_mm: 1100, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-0948', diameter_in: 9, diameter_mm: 225, default_height_mm: 1200, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-1054', diameter_in: 10, diameter_mm: 250, default_height_mm: 1375, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-1252', diameter_in: 12, diameter_mm: 300, default_height_mm: 1320, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-1354', diameter_in: 13, diameter_mm: 325, default_height_mm: 1375, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-1465', diameter_in: 14, diameter_mm: 350, default_height_mm: 1650, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-1665', diameter_in: 16, diameter_mm: 400, default_height_mm: 1650, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-1865', diameter_in: 18, diameter_mm: 450, default_height_mm: 1650, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-2162', diameter_in: 21, diameter_mm: 525, default_height_mm: 1575, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-2472', diameter_in: 24, diameter_mm: 600, default_height_mm: 1825, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-3072', diameter_in: 30, diameter_mm: 700, default_height_mm: 1500, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-3672', diameter_in: 36, diameter_mm: 900, default_height_mm: 1825, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-4272', diameter_in: 42, diameter_mm: 1050, default_height_mm: 1825, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-4872', diameter_in: 48, diameter_mm: 1200, default_height_mm: 1825, max_pressure_bar: 10, type: 'frp' },
      { id: 'v-6386', diameter_in: 63, diameter_mm: 1600, default_height_mm: 2180, max_pressure_bar: 10, type: 'frp' },
    ]);
  }

  // 3. Seed Media Catalog if empty
  const mediaCount = await db.media_catalog.count();
  if (mediaCount === 0) {
    await db.media_catalog.bulkPut([
      {
        id: 'm-gravel',
        name: 'Gravel Support Media',
        bulk_density_kg_m3: 2500,
        rate_minor_per_kg: 8,
        default_depth_mm: 200,
        sort_order: 1,
      },
      {
        id: 'm-sand',
        name: 'Silica Sand Filter Media',
        bulk_density_kg_m3: 1650,
        rate_minor_per_kg: 8,
        default_depth_mm: 500,
        sort_order: 2,
      },
      {
        id: 'm-anthracite',
        name: 'Anthracite Filter Media',
        bulk_density_kg_m3: 850,
        rate_minor_per_kg: 100,
        default_depth_mm: 75,
        sort_order: 3,
      },
      {
        id: 'm-carbon',
        name: 'Granular Activated Carbon (GAC)',
        bulk_density_kg_m3: 529,
        rate_minor_per_kg: 160,
        default_depth_mm: 100,
        sort_order: 4,
      },
      {
        id: 'm-birm',
        name: 'BIRM Iron/Manganese Removal Media',
        bulk_density_kg_m3: 778,
        rate_minor_per_kg: 220,
        default_depth_mm: 0,
        sort_order: 5,
      },
    ]);
  }

  // 4. Seed Cartridge Types if empty
  const cartCount = await db.cartridge_types.count();
  if (cartCount === 0) {
    await db.cartridge_types.bulkPut([
      { id: 'ct-10-05-s', length_in: 10, micron: 5, form: 'slim', ideal_flow_m3h: 1.0 },
      { id: 'ct-10-01-s', length_in: 10, micron: 1, form: 'slim', ideal_flow_m3h: 1.0 },
      { id: 'ct-20-05-s', length_in: 20, micron: 5, form: 'slim', ideal_flow_m3h: 2.0 },
      { id: 'ct-20-01-s', length_in: 20, micron: 1, form: 'slim', ideal_flow_m3h: 2.0 },
      { id: 'ct-20-05-j', length_in: 20, micron: 5, form: 'jumbo', ideal_flow_m3h: 3.5 },
      { id: 'ct-20-01-j', length_in: 20, micron: 1, form: 'jumbo', ideal_flow_m3h: 3.5 },
      { id: 'ct-30-05-s', length_in: 30, micron: 5, form: 'slim', ideal_flow_m3h: 3.0 },
      { id: 'ct-30-01-s', length_in: 30, micron: 1, form: 'slim', ideal_flow_m3h: 3.0 },
      { id: 'ct-40-05-s', length_in: 40, micron: 5, form: 'slim', ideal_flow_m3h: 4.0 },
      { id: 'ct-40-01-s', length_in: 40, micron: 1, form: 'slim', ideal_flow_m3h: 4.0 },
      { id: 'ct-10-05-j', length_in: 10, micron: 5, form: 'jumbo', ideal_flow_m3h: 2.0 },
      { id: 'ct-30-05-j', length_in: 30, micron: 5, form: 'jumbo', ideal_flow_m3h: 5.0 },
      { id: 'ct-40-05-j', length_in: 40, micron: 5, form: 'jumbo', ideal_flow_m3h: 6.0 },
    ]);
  }

  // 5. Seed Housing Types if empty
  const housingCount = await db.housing_types.count();
  if (housingCount === 0) {
    await db.housing_types.bulkPut([
      { id: 'h-10-s-1', form: 'slim', length_in: 10, slots: 1, material: 'PVC' },
      { id: 'h-20-s-1', form: 'slim', length_in: 20, slots: 1, material: 'PVC' },
      { id: 'h-20-s-3', form: 'slim', length_in: 20, slots: 3, material: 'SS304' },
      { id: 'h-20-s-5', form: 'slim', length_in: 20, slots: 5, material: 'SS304' },
      { id: 'h-20-j-1', form: 'jumbo', length_in: 20, slots: 1, material: 'PVC' },
      { id: 'h-20-j-3', form: 'jumbo', length_in: 20, slots: 3, material: 'SS304' },
      { id: 'h-20-j-5', form: 'jumbo', length_in: 20, slots: 5, material: 'SS304' },
      { id: 'h-20-j-7', form: 'jumbo', length_in: 20, slots: 7, material: 'SS304' },
      { id: 'h-30-s-1', form: 'slim', length_in: 30, slots: 1, material: 'PVC' },
      { id: 'h-30-s-5', form: 'slim', length_in: 30, slots: 5, material: 'SS304' },
      { id: 'h-40-s-1', form: 'slim', length_in: 40, slots: 1, material: 'PVC' },
      { id: 'h-40-s-5', form: 'slim', length_in: 40, slots: 5, material: 'SS304' },
      { id: 'h-40-s-7', form: 'slim', length_in: 40, slots: 7, material: 'SS304' },
    ]);
  }

  // 6. Seed Default Company (PAKSAFE) if empty
  const companyCount = await db.companies.count();
  if (companyCount === 0) {
    await db.companies.put({
      id: 'company-paksafe-default',
      name: 'PAKSAFE',
      brand_code: 'PS',
      primary_color: '#1F3A5F',
      accent_color: '#2E75B6',
      watermark_text: 'PAKSAFE - PURIFYING LIFE',
      watermark_opacity: 0.12,
      header_text: 'PAKSAFE / PURIFYING LIFE',
      footer_text: 'PAKSAFE Engineering & Water Treatment Solutions',
      address: 'Plot # 12, Industrial Area, Karachi, Pakistan',
      phone: '+92 21 34567890',
      email: 'info@paksafe.com.pk',
      signatory_name: 'Engr. M. Rashid',
      signatory_title: 'Technical Director',
      default_terms: [
        '75% Advance for RO System at the time of Purchase Order.',
        '15% after delivery of equipment at site.',
        '10% after Installation and Commissioning.',
        'All payments should be released within 10 days from the date of invoice submission.',
      ],
      default_currency: 'PKR',
      ref_pattern: '{BRAND}/PRO/{YY}/{SEQ:4}',
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    });
  }

  // 7. Seed Default Clients if empty
  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    const clientId = 'client-mr-rashid';
    await db.clients.put({
      id: clientId,
      name: 'MR. RASHID',
      attention: 'Engr. Rashid',
      address: 'Sector 5, Industrial Estate, Karachi',
      city: 'Karachi',
      phone: '+92 300 1234567',
      email: 'rashid.eng@example.com',
      industry: 'Beverages & Water',
      status: 'customer',
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    });
  }

  // 8. Seed Default Components (from Proposal PS/PRO/26/0646) if empty
  const compCount = await db.components.count();
  if (compCount === 0) {
    const sampleComponents = [
      {
        id: 'comp-mmf',
        category_id: 'cat-pretreat',
        name: 'Multimedia Filter Vessel',
        specs: [
          { label: 'Brand', value: 'Imported.' },
          { label: 'Material', value: 'FRP' },
          { label: 'Size', value: '16” x 65”' },
          { label: 'Flow rate', value: '03~05 m3/hr.' },
          { label: 'Operating Temp.', value: '49°C' },
          { label: 'Operating Pressure', value: '3~4 Bar(g)' },
          { label: 'Filling Media', value: 'Gravel, Sand & A. Carbon' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 4500000,
      },
      {
        id: 'comp-cf-housing',
        category_id: 'cat-pretreat',
        name: 'Cartridge Filter Housing',
        specs: [
          { label: 'Model', value: 'PVC Housing for Slim Filters' },
          { label: 'Origin', value: 'Imported' },
          { label: 'Material of Construction', value: 'PVC' },
          { label: 'Size', value: '20” Jumbo' },
          { label: 'Design Pressure', value: '3~4 Bar(g)' },
          { label: 'No. of Filters', value: '05 Filters/Housing' },
          { label: 'Location', value: 'Feed Water Line' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 2200000,
      },
      {
        id: 'comp-cf-cartridge',
        category_id: 'cat-pretreat',
        name: 'Cartridge Filter',
        specs: [
          { label: 'Make/Made', value: 'Hydro-Safe' },
          { label: 'Application', value: 'Filtration' },
          { label: 'Material of Construction', value: '100% PPF' },
          { label: 'ID / OD', value: '25mm / 65mm' },
          { label: 'Length of Filter', value: '20” Jumbo' },
          { label: 'Filtration Frequency', value: '05 micron' },
          { label: 'Chemical Resistant', value: 'Excellent' },
          { label: 'Max. Temperature', value: '45°C' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 350000,
      },
      {
        id: 'comp-dosing-pump',
        category_id: 'cat-dosing',
        name: 'Dosing Pump',
        specs: [
          { label: 'Model', value: 'PKX MA/A' },
          { label: 'Make', value: 'ETATRON' },
          { label: 'Origin', value: 'Italy' },
          { label: 'Application', value: 'Chemical Dosing' },
          { label: 'Max. Flow Rate', value: '05 Lit/Hr.' },
          { label: 'Pressure', value: '05 Bar(g)' },
          { label: 'Housing', value: 'PP Reinforced' },
          { label: 'Pump Head', value: 'PP with Lip or Ceramic Ball Valve' },
          { label: 'Diaphragm', value: 'PTFE' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 3200000,
      },
      {
        id: 'comp-dosing-tank',
        category_id: 'cat-dosing',
        name: 'Dosing Tank',
        specs: [
          { label: 'Brand/Manufacturer', value: 'Local' },
          { label: 'Material of Construction', value: 'HDPE/PP' },
          { label: 'Capacity', value: '80 Liters' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 850000,
      },
      {
        id: 'comp-cleaning-tank',
        category_id: 'cat-cip',
        name: 'Cleaning Tank (CIP)',
        specs: [
          { label: 'Brand/Manufacturer', value: 'Local' },
          { label: 'Material of Construction', value: 'HDPE/PP' },
          { label: 'Capacity', value: '80 Liters' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 850000,
      },
      {
        id: 'comp-feed-pump',
        category_id: 'cat-pumps',
        name: 'Feed Pump',
        specs: [
          { label: 'Make', value: 'Grundfos' },
          { label: 'Rated Flow', value: '02 m3/hr.' },
          { label: 'Rated Head', value: '3~4 Bar(g)' },
          { label: 'MOC', value: 'SS 316' },
          { label: 'Power Req.', value: '1.1 kW' },
          { label: 'Voltage', value: '3 x 380-415D V' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 5800000,
      },
      {
        id: 'comp-hp-pump',
        category_id: 'cat-pumps',
        name: 'High Pressure Pump',
        specs: [
          { label: 'Model', value: 'CRN / CNP' },
          { label: 'Make', value: 'Grundfos' },
          { label: 'Rated Flow', value: '02 m3/hr.' },
          { label: 'Rated Head', value: '15~20 Bar(g)' },
          { label: 'MOC', value: 'SS 316' },
          { label: 'Power Req.', value: '5.5 kW' },
          { label: 'Voltage', value: '3 x 380-415D V' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 14500000,
      },
      {
        id: 'comp-ro-membrane',
        category_id: 'cat-ro',
        name: 'RO Membrane Element',
        specs: [
          { label: 'Model', value: 'BW30 PRO-400' },
          { label: 'Make', value: 'Dupont Filmtec OR Toray' },
          { label: 'Origin', value: 'USA' },
          { label: 'Dia', value: '8 inches' },
          { label: 'Length', value: '40 inches' },
          { label: 'Permeate Flow Rate', value: '7,500 GPD (28m3/d)' },
          { label: 'Min Salt Rejection', value: '99.6%' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 8500000,
      },
      {
        id: 'comp-membrane-housing',
        category_id: 'cat-ro',
        name: 'Membrane Housing',
        specs: [
          { label: 'Brand/Manufacturer', value: 'China' },
          { label: 'Origin', value: 'Imported' },
          { label: 'Material of Construction', value: 'FRP' },
          { label: 'Max. Operating Pressure', value: '300 psi' },
          { label: 'Model', value: 'Single-Element Housing' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 3800000,
      },
      {
        id: 'comp-instrumentation',
        category_id: 'cat-inst',
        name: 'Digital TDS Controller & Rotameters',
        specs: [
          { label: 'TDS Controller', value: 'ROC or Equivalent (Digital, Feed & Product)' },
          { label: 'Sensor Cable', value: '6m' },
          { label: 'Flow Meter (Rotameter)', value: 'LZ Series 25 GPM PE Body (Qty: 02)' },
          { label: 'Pressure Gauges', value: 'Wika Liquid Filled SS 0~6 & 0~25 Bar(g)' },
        ],
        cost_minor: 4200000,
      },
      {
        id: 'comp-control-panel',
        category_id: 'cat-electrical',
        name: 'Control Panel',
        specs: [
          { label: 'Control Type', value: 'Semi-Automatic' },
          { label: 'Components', value: 'Breakers, Overload Relays, Timer, Cables' },
          { label: 'Panel Box', value: 'MS Powder Coated NEMA-4 Enclosure' },
          { label: 'Quantity', value: '01' },
        ],
        cost_minor: 6500000,
      },
      {
        id: 'comp-piping-skid',
        category_id: 'cat-skid',
        name: 'Piping, Valves & SS Skid Frame',
        specs: [
          { label: 'Piping & Fittings', value: 'PVC Sch#80 High & Low Pressure' },
          { label: 'Sampling Valves', value: '1/4 Quick Connection PVDF' },
          { label: 'Skid Frame', value: 'SS 202 - Epoxy Coated' },
          { label: 'Quantity', value: '01 Lot' },
        ],
        cost_minor: 7500000,
      },
    ];

    for (const c of sampleComponents) {
      await db.components.put({
        ...c,
        created_at: now,
        client_updated_at: now,
        _dirty: 0,
      });
    }
  }

  // 9. Seed Default Template (10,000 GPD BWRO Plant) if empty
  const templateCount = await db.templates.count();
  if (templateCount === 0) {
    const tplId = 'template-bwro-10k';
    await db.templates.put({
      id: tplId,
      name: '10,000 GPD BWRO Plant (Semi-Automatic)',
      description: 'Standard brackish water reverse osmosis package with multimedia filtration, antiscalant dosing, 8x40 membrane, and SS skid.',
      plant_type: 'BWRO Plant (Semi-Automatic)',
      default_capacity_gpd: 10000,
      default_intro: 'Technical and commercial proposal for design, manufacturing, supply, and commissioning of 10,000 GPD BWRO Plant.',
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    });
  }

  // 10. Seed Sample Proposal (PS/PRO/26/0646) if empty
  const proposalCount = await db.proposals.count();
  if (proposalCount === 0) {
    const propId = 'prop-ps-26-0646';
    await db.proposals.put({
      id: propId,
      company_id: 'company-paksafe-default',
      client_id: 'client-mr-rashid',
      client_snapshot: {
        client_name: 'M/S MR. RASHID',
        attention: 'Mr. Rashid',
        address: 'Karachi, Pakistan',
        city: 'Karachi',
        phone: '+92 300 1234567',
      },
      ref_base: 'PS/PRO/26/0646',
      rev: 1,
      status: 'draft',
      title: '10,000 GPD BWRO Plant (Semi-Automatic)',
      design: {
        feed_flow: 10000,
        feed_unit: 'GPD',
        recovery_pct: 50,
        design_tds_ppm: 5000,
        product_tds_ppm: 300,
        inlet_pressure_bar: 16,
        temperature_c: 25,
      },
      currency: 'PKR',
      price_mode: 'lump',
      lump_amount_minor: 735000,
      payment_terms: [
        { label: '75% Advance for RO System at the time of Purchase Order.', percent: 75, amount: 551250 },
        { label: '15% after delivery.', percent: 15, amount: 110250 },
        { label: '10% after Installation and Commissioning.', percent: 10, amount: 73500 },
      ],
      delivery_text: 'Within 02~04 weeks after receiving confirmed Purchase Order & Advance.',
      validity_days: 30,
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    });
  }
}
