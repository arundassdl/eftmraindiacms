import type { CollectionConfig } from "payload";
import { HeroBlock } from "../blocks/HeroBlock";
import { CTAFormBlock } from "../blocks/CTAFormBlock";
import { HomeHeroBlock } from "../blocks/HomeHeroBlock";
import { EftmraHeroBlock } from "../blocks/EftmraHeroBlock";
import { EftmraTrustStripBlock } from "../blocks/EftmraTrustStripBlock";
import { EftmraExplainerBlock } from "../blocks/EftmraExplainerBlock";
import { EftmraCertificationBlock } from "../blocks/EftmraCertificationBlock";
import { EftmraPathwayBlock } from "../blocks/EftmraPathwayBlock";
import { EftmraCoursesBlock } from "../blocks/EftmraCoursesBlock";
import { EftmraPractitionersBlock } from "../blocks/EftmraPractitionersBlock";
import { EftmraTestimonialsBlock } from "../blocks/EftmraTestimonialsBlock";
import { EftmraFinalCtaBlock } from "../blocks/EftmraFinalCtaBlock";
import { EftmraPageHeaderBlock } from "../blocks/EftmraPageHeaderBlock";
import { EftmraCardGridBlock } from "../blocks/EftmraCardGridBlock";
import { EftmraContentSectionBlock } from "../blocks/EftmraContentSectionBlock";
import { EftmraMediaRowBlock } from "../blocks/EftmraMediaRowBlock";
import { EftmraContactSectionBlock } from "../blocks/EftmraContactSectionBlock";
import { EftmraProfileHeroBlock } from "../blocks/EftmraProfileHeroBlock";
import { EftmraReviewsBlock } from "../blocks/EftmraReviewsBlock";
import { EftmraTrainingDetailBlock } from "../blocks/EftmraTrainingDetailBlock";
import { EftmraLineageBlock } from "../blocks/EftmraLineageBlock";
import { EftmraPractitionerRegistrationBlock } from "../blocks/EftmraPractitionerRegistrationBlock";
import { EftmraTestimonialListingBlock } from "../blocks/EftmraTestimonialListingBlock";
import { EftmraTrainerListingBlock } from "../blocks/EftmraTrainerListingBlock";

export const Pages: CollectionConfig = {
  slug: "pages",
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "site", "_status"],
    group: "Content & Site",
    description: "Manage website pages and their page-builder layouts.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      defaultValue: "home",
    },
    {
      name: "site",
      type: "relationship",
      relationTo: "sites",
      required: true,
    },
    {
      name: "layout",
      type: "blocks",
      blocks: [
        HomeHeroBlock,
        HeroBlock,
        CTAFormBlock,
        EftmraHeroBlock,
        EftmraTrustStripBlock,
        EftmraExplainerBlock,
        EftmraCertificationBlock,
        EftmraPathwayBlock,
        EftmraCoursesBlock,
        EftmraPractitionersBlock,
        EftmraTestimonialsBlock,
        EftmraFinalCtaBlock,
        EftmraPageHeaderBlock,
        EftmraCardGridBlock,
        EftmraContentSectionBlock,
        EftmraMediaRowBlock,
        EftmraContactSectionBlock,
        EftmraProfileHeroBlock,
        EftmraReviewsBlock,
        EftmraTrainingDetailBlock,
        EftmraLineageBlock,
        EftmraPractitionerRegistrationBlock,
        EftmraTestimonialListingBlock,
        EftmraTrainerListingBlock,
      ],
    },
  ],
};
