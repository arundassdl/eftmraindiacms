import * as migration_20260414_054916_update_existing_posts from './20260414_054916_update_existing_posts';
import * as migration_20260414_104656_import_pages_seed from './20260414_104656_import_pages_seed';
import * as migration_20260414_114037_seed_new_pages from './20260414_114037_seed_new_pages';
import * as migration_20260414_173017_seed_admin_user from './20260414_173017_seed_admin_user';
import * as migration_20260414_174548_seed_header_footer_globals from './20260414_174548_seed_header_footer_globals';
import * as migration_20260424_151200_publish_existing_drafts from './20260424_151200_publish_existing_drafts';
import * as migration_20260427_171600_seed_role_module_visibility from './20260427_171600_seed_role_module_visibility';
import * as migration_20260429_090000_seed_all_collections from './20260429_090000_seed_all_collections';
import * as migration_20260429_110000_reseed_relationship_collections from './20260429_110000_reseed_relationship_collections';
import * as migration_20260429_120000_reseed_practitioner_reviews from './20260429_120000_reseed_practitioner_reviews';
import * as migration_20260429_130000_reseed_ordered_relationships from './20260429_130000_reseed_ordered_relationships';
import * as migration_20260429_140000_reseed_reviews_after_hook_fix from './20260429_140000_reseed_reviews_after_hook_fix';
import * as migration_20260505_000000_consolidate_gallery_album from './20260505_000000_consolidate_gallery_album';
import * as migration_20260505_010000_seed_training_flyer_data from './20260505_010000_seed_training_flyer_data';
import * as migration_20260505_030000_seed_legal_pages from './20260505_030000_seed_legal_pages';
import * as migration_20260505_040000_prune_training_seed_records from './20260505_040000_prune_training_seed_records';
import * as migration_20260505_050000_prune_duplicate_pages from './20260505_050000_prune_duplicate_pages';
import * as migration_20260505_060000_prune_orphan_page_versions from './20260505_060000_prune_orphan_page_versions';
import * as migration_20260516_121500_add_role_management from './20260516_121500_add_role_management';
import * as migration_20260516_123200_seed_superadmin_role from './20260516_123200_seed_superadmin_role';
import * as migration_20260523_000000_add_trainers_and_review_links from './20260523_000000_add_trainers_and_review_links';
import * as migration_20260523_000001_seed_trainer_role_permissions from './20260523_000001_seed_trainer_role_permissions';
import * as migration_20260525_000000_seed_practitioner_registration_options from './20260525_000000_seed_practitioner_registration_options';
import * as migration_20260525_000001_seed_practitioner_registration_option_permissions from './20260525_000001_seed_practitioner_registration_option_permissions';
import * as migration_20260525_000002_align_practitioner_registration_fields from './20260525_000002_align_practitioner_registration_fields';
import * as migration_20260525_000003_add_practitioner_registration_uploads from './20260525_000003_add_practitioner_registration_uploads';
import * as migration_20260525_000004_add_practitioner_registration_name_currency from './20260525_000004_add_practitioner_registration_name_currency';
import * as migration_20260525_000005_add_trainer_contacts from './20260525_000005_add_trainer_contacts';
import * as migration_20260525_000006_seed_trainer_contact_permissions from './20260525_000006_seed_trainer_contact_permissions';
import * as migration_20260526_000000_add_email_templates from './20260526_000000_add_email_templates';
import * as migration_20260526_000001_seed_simple_email_templates from './20260526_000001_seed_simple_email_templates';
import * as migration_20260526_000002_add_email_accounts_module from './20260526_000002_add_email_accounts_module';
import * as migration_20260526_000003_ensure_required_email_templates from './20260526_000003_ensure_required_email_templates';
import * as migration_20260526_000004_seed_default_resend_email_account from './20260526_000004_seed_default_resend_email_account';
import * as migration_20260526_000005_seed_email_template_address_fields from './20260526_000005_seed_email_template_address_fields';
import * as migration_20260526_000006_seed_email_module_permissions from './20260526_000006_seed_email_module_permissions';
import * as migration_20260527_000000_seed_trainers from './20260527_000000_seed_trainers';
import * as migration_20260527_000001_add_dynamic_trainer_listing_blocks from './20260527_000001_add_dynamic_trainer_listing_blocks';
import * as migration_20260527_000002_remove_rafeeq_trainer from './20260527_000002_remove_rafeeq_trainer';
import * as migration_20260529_000000_add_practitioner_address from './20260529_000000_add_practitioner_address';
import * as migration_20260529_000001_split_practitioner_address_lines from './20260529_000001_split_practitioner_address_lines';
import * as migration_20260529_000002_fix_practitioner_address_line_column_names from './20260529_000002_fix_practitioner_address_line_column_names';

export const migrations = [
  {
    up: migration_20260414_054916_update_existing_posts.up,
    down: migration_20260414_054916_update_existing_posts.down,
    name: '20260414_054916_update_existing_posts',
  },
  {
    up: migration_20260414_104656_import_pages_seed.up,
    down: migration_20260414_104656_import_pages_seed.down,
    name: '20260414_104656_import_pages_seed',
  },
  {
    up: migration_20260414_114037_seed_new_pages.up,
    down: migration_20260414_114037_seed_new_pages.down,
    name: '20260414_114037_seed_new_pages',
  },
  {
    up: migration_20260414_173017_seed_admin_user.up,
    down: migration_20260414_173017_seed_admin_user.down,
    name: '20260414_173017_seed_admin_user',
  },
  {
    up: migration_20260414_174548_seed_header_footer_globals.up,
    down: migration_20260414_174548_seed_header_footer_globals.down,
    name: '20260414_174548_seed_header_footer_globals'
  },
  {
    up: migration_20260424_151200_publish_existing_drafts.up,
    down: migration_20260424_151200_publish_existing_drafts.down,
    name: '20260424_151200_publish_existing_drafts',
  },
  {
    up: migration_20260427_171600_seed_role_module_visibility.up,
    down: migration_20260427_171600_seed_role_module_visibility.down,
    name: '20260427_171600_seed_role_module_visibility',
  },
  {
    up: migration_20260429_090000_seed_all_collections.up,
    down: migration_20260429_090000_seed_all_collections.down,
    name: '20260429_090000_seed_all_collections',
  },
  {
    up: migration_20260429_110000_reseed_relationship_collections.up,
    down: migration_20260429_110000_reseed_relationship_collections.down,
    name: '20260429_110000_reseed_relationship_collections',
  },
  {
    up: migration_20260429_120000_reseed_practitioner_reviews.up,
    down: migration_20260429_120000_reseed_practitioner_reviews.down,
    name: '20260429_120000_reseed_practitioner_reviews',
  },
  {
    up: migration_20260429_130000_reseed_ordered_relationships.up,
    down: migration_20260429_130000_reseed_ordered_relationships.down,
    name: '20260429_130000_reseed_ordered_relationships',
  },
  {
    up: migration_20260429_140000_reseed_reviews_after_hook_fix.up,
    down: migration_20260429_140000_reseed_reviews_after_hook_fix.down,
    name: '20260429_140000_reseed_reviews_after_hook_fix',
  },
  {
    up: migration_20260505_000000_consolidate_gallery_album.up,
    down: migration_20260505_000000_consolidate_gallery_album.down,
    name: '20260505_000000_consolidate_gallery_album',
  },
  {
    up: migration_20260505_010000_seed_training_flyer_data.up,
    down: migration_20260505_010000_seed_training_flyer_data.down,
    name: '20260505_010000_seed_training_flyer_data',
  },
  {
    up: migration_20260505_030000_seed_legal_pages.up,
    down: migration_20260505_030000_seed_legal_pages.down,
    name: '20260505_030000_seed_legal_pages',
  },
  {
    up: migration_20260505_040000_prune_training_seed_records.up,
    down: migration_20260505_040000_prune_training_seed_records.down,
    name: '20260505_040000_prune_training_seed_records',
  },
  {
    up: migration_20260505_050000_prune_duplicate_pages.up,
    down: migration_20260505_050000_prune_duplicate_pages.down,
    name: '20260505_050000_prune_duplicate_pages',
  },
  {
    up: migration_20260505_060000_prune_orphan_page_versions.up,
    down: migration_20260505_060000_prune_orphan_page_versions.down,
    name: '20260505_060000_prune_orphan_page_versions',
  },
  {
    up: migration_20260516_121500_add_role_management.up,
    down: migration_20260516_121500_add_role_management.down,
    name: '20260516_121500_add_role_management',
  },
  {
    up: migration_20260516_123200_seed_superadmin_role.up,
    down: migration_20260516_123200_seed_superadmin_role.down,
    name: '20260516_123200_seed_superadmin_role',
  },
  {
    up: migration_20260523_000000_add_trainers_and_review_links.up,
    down: migration_20260523_000000_add_trainers_and_review_links.down,
    name: '20260523_000000_add_trainers_and_review_links',
  },
  {
    up: migration_20260523_000001_seed_trainer_role_permissions.up,
    down: migration_20260523_000001_seed_trainer_role_permissions.down,
    name: '20260523_000001_seed_trainer_role_permissions',
  },
  {
    up: migration_20260525_000000_seed_practitioner_registration_options.up,
    down: migration_20260525_000000_seed_practitioner_registration_options.down,
    name: '20260525_000000_seed_practitioner_registration_options',
  },
  {
    up: migration_20260525_000001_seed_practitioner_registration_option_permissions.up,
    down: migration_20260525_000001_seed_practitioner_registration_option_permissions.down,
    name: '20260525_000001_seed_practitioner_registration_option_permissions',
  },
  {
    up: migration_20260525_000002_align_practitioner_registration_fields.up,
    down: migration_20260525_000002_align_practitioner_registration_fields.down,
    name: '20260525_000002_align_practitioner_registration_fields',
  },
  {
    up: migration_20260525_000003_add_practitioner_registration_uploads.up,
    down: migration_20260525_000003_add_practitioner_registration_uploads.down,
    name: '20260525_000003_add_practitioner_registration_uploads',
  },
  {
    up: migration_20260525_000004_add_practitioner_registration_name_currency.up,
    down: migration_20260525_000004_add_practitioner_registration_name_currency.down,
    name: '20260525_000004_add_practitioner_registration_name_currency',
  },
  {
    up: migration_20260525_000005_add_trainer_contacts.up,
    down: migration_20260525_000005_add_trainer_contacts.down,
    name: '20260525_000005_add_trainer_contacts',
  },
  {
    up: migration_20260525_000006_seed_trainer_contact_permissions.up,
    down: migration_20260525_000006_seed_trainer_contact_permissions.down,
    name: '20260525_000006_seed_trainer_contact_permissions',
  },
  {
    up: migration_20260526_000000_add_email_templates.up,
    down: migration_20260526_000000_add_email_templates.down,
    name: '20260526_000000_add_email_templates',
  },
  {
    up: migration_20260526_000001_seed_simple_email_templates.up,
    down: migration_20260526_000001_seed_simple_email_templates.down,
    name: '20260526_000001_seed_simple_email_templates',
  },
  {
    up: migration_20260526_000002_add_email_accounts_module.up,
    down: migration_20260526_000002_add_email_accounts_module.down,
    name: '20260526_000002_add_email_accounts_module',
  },
  {
    up: migration_20260526_000003_ensure_required_email_templates.up,
    down: migration_20260526_000003_ensure_required_email_templates.down,
    name: '20260526_000003_ensure_required_email_templates',
  },
  {
    up: migration_20260526_000004_seed_default_resend_email_account.up,
    down: migration_20260526_000004_seed_default_resend_email_account.down,
    name: '20260526_000004_seed_default_resend_email_account',
  },
  {
    up: migration_20260526_000005_seed_email_template_address_fields.up,
    down: migration_20260526_000005_seed_email_template_address_fields.down,
    name: '20260526_000005_seed_email_template_address_fields',
  },
  {
    up: migration_20260526_000006_seed_email_module_permissions.up,
    down: migration_20260526_000006_seed_email_module_permissions.down,
    name: '20260526_000006_seed_email_module_permissions',
  },
  {
    up: migration_20260527_000000_seed_trainers.up,
    down: migration_20260527_000000_seed_trainers.down,
    name: '20260527_000000_seed_trainers',
  },
  {
    up: migration_20260527_000001_add_dynamic_trainer_listing_blocks.up,
    down: migration_20260527_000001_add_dynamic_trainer_listing_blocks.down,
    name: '20260527_000001_add_dynamic_trainer_listing_blocks',
  },
  {
    up: migration_20260527_000002_remove_rafeeq_trainer.up,
    down: migration_20260527_000002_remove_rafeeq_trainer.down,
    name: '20260527_000002_remove_rafeeq_trainer',
  },
  {
    up: migration_20260529_000000_add_practitioner_address.up,
    down: migration_20260529_000000_add_practitioner_address.down,
    name: '20260529_000000_add_practitioner_address',
  },
  {
    up: migration_20260529_000001_split_practitioner_address_lines.up,
    down: migration_20260529_000001_split_practitioner_address_lines.down,
    name: '20260529_000001_split_practitioner_address_lines',
  },
  {
    up: migration_20260529_000002_fix_practitioner_address_line_column_names.up,
    down: migration_20260529_000002_fix_practitioner_address_line_column_names.down,
    name: '20260529_000002_fix_practitioner_address_line_column_names',
  },
];
