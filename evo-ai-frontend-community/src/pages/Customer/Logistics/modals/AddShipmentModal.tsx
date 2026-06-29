import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, Input, Button, Label } from '@evoapi/design-system';

interface AddShipmentModalProps {
  onClose: () => void;
}

const AddShipmentModal: React.FC<AddShipmentModalProps> = ({ onClose }) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Envio</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>ID do Pedido *</Label>
            <Input placeholder="PED-2026-001" />
          </div>
          <div className="space-y-2">
            <Label>Código de Rastreamento *</Label>
            <Input placeholder="Ex: IMP82348234BR" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Transportadora Vinculada *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>Selecione...</option>
              <option>Império Log (Interno)</option>
              <option>Correios Sedex</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Veículo / Motorista *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>Selecione...</option>
              <option>Carlos Alberto (IMP-1234)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Endereço de Partida *</Label>
          <Input placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP" />
        </div>

        <div className="space-y-2">
          <Label>Endereço de Destino *</Label>
          <Input placeholder="Ex: Av. Brigadeiro Luís Antônio, 2300 - São Paulo, SP" />
        </div>

        <div className="space-y-2">
          <Label>Status Operacional</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option>Em Trânsito</option>
            <option>Entregue</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={onClose}>Registrar Rota</Button>
      </div>
    </DialogContent>
  );
};

export default AddShipmentModal;
