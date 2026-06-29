import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, Input, Button, Label } from '@evoapi/design-system';

interface AddVehicleModalProps {
  onClose: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose }) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Cadastrar Novo Caminhão</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Placa do Veículo *</Label>
            <Input placeholder="Ex: ABC-1234" />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Veículo *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>fiorino</option>
              <option>toco</option>
              <option>truck</option>
              <option>carreta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Consumo Médio (KM/L)</Label>
            <Input type="number" placeholder="0.0" />
          </div>
          <div className="space-y-2">
            <Label>Capacidade Máxima (Kg)</Label>
            <Input type="number" placeholder="0" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Nome do Motorista *</Label>
          <Input placeholder="Nome completo" />
        </div>

        <div className="space-y-2">
          <Label>Status Operacional</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option>Disponível</option>
            <option>Em Viagem</option>
            <option>Manutenção</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={onClose}>Salvar</Button>
      </div>
    </DialogContent>
  );
};

export default AddVehicleModal;
