'use client';

import React from 'react';
import { TemplateManager } from '@/components/labels/TemplateManager';
import { LabelTemplate } from '@/lib/types/labels';

export default function LabelsPage() {
  // TODO: Implement data fetching from Supabase
  const templates: LabelTemplate[] = [];

  const handleSaveTemplate = (template: LabelTemplate) => {
    // TODO: Implement save to Supabase
    console.log('Saving template:', template);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // TODO: Implement delete from Supabase
    console.log('Deleting template:', templateId);
  };

  return (
    <TemplateManager
      templates={templates}
      onSaveTemplate={handleSaveTemplate}
      onDeleteTemplate={handleDeleteTemplate}
    />
  );
}
