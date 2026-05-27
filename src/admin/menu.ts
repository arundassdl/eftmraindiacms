// src/admin/menu.ts
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Tags,
  MessageSquare,
  GraduationCap,
  ClipboardList,
  MapPinned,
  UserRound,
  Star,
  ImageIcon,
  Users,
  Globe,
  Settings,
  PanelTop,
  PanelBottom,
  ShieldCheck,
} from 'lucide-react'

export const adminMenu = {
  dashboard: {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },

  content: {
    label: 'Content & Site',
    items: [
      { slug: 'pages', label: 'Pages', icon: FileText },
      { slug: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    ],
  },

  resources: {
    label: 'Resources',
    items: [
      { slug: 'posts', label: 'Posts', icon: Newspaper },
      { slug: 'categories', label: 'Categories', icon: Tags },
      { slug: 'gallery', label: 'Gallery', icon: ImageIcon },
    ],
  },

  trainings: {
    label: 'Trainings',
    items: [
      { slug: 'trainings', label: 'Trainings', icon: GraduationCap },
      { slug: 'trainers', label: 'Trainers', icon: UserRound },
      { slug: 'trainer-contacts', label: 'Trainer Contacts', icon: MessageSquare },
      { slug: 'training-registrations', label: 'Training Registrations', icon: ClipboardList },
      { slug: 'training-reviews', label: 'Training Reviews', icon: Star },
    ],
  },

  practitioners: {
    label: 'Practitioners',
    items: [
      { slug: 'practitioners', label: 'Practitioners', icon: UserRound },
      { slug: 'practitioner-registrations', label: 'Practitioner Registrations', icon: ClipboardList },
      { slug: 'practitioner-registration-countries', label: 'Registration Countries', icon: MapPinned },
      { slug: 'practitioner-registration-specialties', label: 'Registration Specialties', icon: Tags },
      { slug: 'practitioner-reviews', label: 'Practitioner Reviews', icon: Star },
    ],
  },

  crm: {
    label: 'CRM',
    items: [
      { slug: 'leads', label: 'Leads', icon: MessageSquare },
    ],
  },

  system: {
    label: 'System',
    items: [
      { slug: 'media', label: 'Media', icon: ImageIcon },
      { slug: 'sites', label: 'Sites', icon: Globe },
      { slug: 'role-management', label: 'Role Management', icon: ShieldCheck },
      { slug: 'users', label: 'Users', icon: Users },
    ],
  },

  settings: {
    label: 'Settings',
    globals: [
      { slug: 'header', label: 'Header', icon: PanelTop },
      { slug: 'footer', label: 'Footer', icon: PanelBottom },
      { slug: 'role-module-visibility', label: 'Role Module Visibility', icon: ShieldCheck },
    ],
  },
}
