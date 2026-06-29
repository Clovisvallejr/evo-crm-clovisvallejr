import { useLanguage } from '@/hooks/useLanguage';
import AppModal from '@/components/shared/AppModal';
import {
  Button,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@evoapi/design-system';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Segment,
  SegmentFormData,
  SegmentDefinition,
  SegmentNodeUnion,
  DEFAULT_SEGMENT_DEFINITION,
  UserPropertyNode,
} from '@/types/analytics';
import SegmentConditionEditor from './SegmentConditionEditor';

interface SegmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment?: Segment;
  isNew: boolean;
  loading: boolean;
  onSubmit: (data: SegmentFormData) => void;
}

export default function SegmentModal({
  open,
  onOpenChange,
  segment,
  isNew,
  loading,
  onSubmit,
}: SegmentModalProps) {
  const { t } = useLanguage('segments');
  const [formData, setFormData] = useState<SegmentFormData>({
    name: '',
    definition: DEFAULT_SEGMENT_DEFINITION,
    status: 'running',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [definitionType, setDefinitionType] = useState<'Everyone' | 'And' | 'Or'>('Everyone');
  const [nodes, setNodes] = useState<SegmentNodeUnion[]>([]);

  useEffect(() => {
    if (segment && !isNew) {
      setFormData({
        name: segment.name,
        definition: segment.definition,
        status: segment.status,
      });
      setDefinitionType(segment.definition.entryNode.type as 'Everyone' | 'And' | 'Or');
      setNodes(segment.definition.nodes || []);
    } else {
      setFormData({
        name: '',
        definition: DEFAULT_SEGMENT_DEFINITION,
        status: 'running',
      });
      setDefinitionType('Everyone');
      setNodes([]);
    }
    setErrors({});
  }, [segment, isNew, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('modal.validation.nameRequired');
    }

    if (formData.name.trim().length < 2) {
      newErrors.name = t('modal.validation.nameMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const definition: SegmentDefinition = {
      nodes,
      entryNode: {
        id: 'entry',
        type: definitionType,
        children: definitionType === 'Everyone' ? undefined : nodes.map((n) => n.id),
      },
    };

    onSubmit({
      ...formData,
      definition,
    });
  };

  const handleInputChange = (field: keyof SegmentFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleDefinitionTypeChange = (value: 'Everyone' | 'And' | 'Or') => {
    setDefinitionType(value);
    if (value === 'Everyone') {
      setNodes([]);
    }
  };

  const addCondition = () => {
    const newNode: UserPropertyNode = {
      id: uuidv4(),
      type: 'UserProperty',
      path: '',
      operator: {
        type: 'Equals',
        value: '',
      },
    };
    setNodes([...nodes, newNode]);
  };

  const updateCondition = (index: number, node: SegmentNodeUnion) => {
    const updated = [...nodes];
    updated[index] = node;
    setNodes(updated);
  };

  const removeCondition = (index: number) => {
    setNodes(nodes.filter((_, i) => i !== index));
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={isNew ? t('modal.createTitle') : t('modal.editTitle')}
      description={isNew ? t('modal.createDescription') : t('modal.editDescription')}
      maxWidthClass="sm:max-w-[600px]"
      onClose={() => onOpenChange(false)}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('modal.cancel')}
          </Button>
          <Button type="submit" disabled={loading} form="segment-form">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                {isNew ? t('modal.creating') : t('modal.saving')}
              </span>
            ) : isNew ? (
              t('modal.createButton')
            ) : (
              t('modal.saveButton')
            )}
          </Button>
        </>
      }
    >
      <form id="segment-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-muted/40 p-4 rounded-lg">
          <Label htmlFor="name" className="text-sm font-medium mb-2">
            {t('modal.segmentName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder={t('modal.segmentNamePlaceholder')}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <span className="text-sm text-red-500 mt-1">{errors.name}</span>}
        </div>

        <div className="bg-muted/40 p-4 rounded-lg">
          <Label className="text-sm font-medium mb-3">{t('modal.combinationType')}</Label>
          <RadioGroup value={definitionType} onValueChange={handleDefinitionTypeChange}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="Everyone" id="everyone" />
              <label htmlFor="everyone" className="text-sm cursor-pointer">
                {t('modal.combinationTypes.everyone')}
              </label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="And" id="and" />
              <label htmlFor="and" className="text-sm cursor-pointer">
                {t('modal.combinationTypes.and')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Or" id="or" />
              <label htmlFor="or" className="text-sm cursor-pointer">
                {t('modal.combinationTypes.or')}
              </label>
            </div>
          </RadioGroup>
        </div>

        {definitionType === 'Everyone' && (
          <div className="bg-muted/40 border rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-1">{t('modal.universalSegment.title')}</h4>
            <p className="text-sm text-muted-foreground">{t('modal.universalSegment.description')}</p>
          </div>
        )}

        {definitionType !== 'Everyone' && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t('modal.segmentConditions')}</Label>

            {nodes.map((node, index) => (
              <SegmentConditionEditor
                key={node.id}
                condition={node}
                index={index}
                onUpdate={updateCondition}
                onRemove={removeCondition}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addCondition}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('modal.addCondition')}
            </Button>
          </div>
        )}
      </form>
    </AppModal>
  );
}
