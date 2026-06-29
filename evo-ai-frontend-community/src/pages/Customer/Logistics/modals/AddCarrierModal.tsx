import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, Input, Button, Label } from '@evoapi/design-system';

interface AddCarrierModalProps {
  onClose: () => void;
}

const AddCarrierModal: React.FC<AddCarrierModalProps> = ({ onClose }) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Cadastrar Transportadora</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label>Nome da Transportadora *</Label>
          <Input placeholder="Ex: Império Express" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Valor por KM (R$)</Label>
            <Input type="number" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label>Diesel Base (R$ / Litro)</Label>
            <Input type="number" placeholder="0.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Velocidade Média (KM/H)</Label>
            <Input type="number" placeholder="60" />
          </div>
          <div className="space-y-2">
            <Label>Status Operacional</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>Ativa</option>
              <option>Inativa</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={onClose}>Salvar</Button>
      </div>
    </DialogContent>
  );
};

export default AddCarrierModal;
