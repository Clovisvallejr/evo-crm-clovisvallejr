import React, { useState, useEffect } from 'react';
import { Database, Download, Trash, RefreshCw, Play, Save, AlertTriangle } from 'lucide-react';
import { Button, Card, Input, Label } from '@evoapi/design-system';
import api from '@/services/core/api';
import { toast } from 'sonner';

interface BackupFile {
  name: string;
  size: number;
  created_at: string;
}

interface BackupConfig {
  auto_backup_enabled: boolean;
  backup_frequency: string;
  backup_retention: number;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    auto_backup_enabled: false,
    backup_frequency: 'daily',
    backup_retention: 5,
  });
  const [loading, setLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backups');
      setBackups(response.data.backups || []);
      setConfig(response.data.config || {
        auto_backup_enabled: false,
        backup_frequency: 'daily',
        backup_retention: 5,
      });
    } catch (error: any) {
      toast.error('Erro ao carregar dados de backup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    toast.loading('Criando backup...', { id: 'create-backup' });
    try {
      const response = await api.post('/backups');
      toast.success(response.data.message || 'Backup criado com sucesso!', { id: 'create-backup' });
      fetchBackups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar backup', { id: 'create-backup' });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o backup ${filename}?`)) return;

    try {
      await api.delete(`/backups/${filename}`);
      toast.success('Backup excluído com sucesso');
      fetchBackups();
    } catch (error: any) {
      toast.error('Erro ao excluir backup');
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      toast.loading('Preparando download...', { id: 'download-backup' });
      const response = await api.get(`/backups/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Download iniciado!', { id: 'download-backup' });
    } catch (error: any) {
      toast.error('Erro ao baixar backup', { id: 'download-backup' });
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    const confirmation = window.prompt(
      `ATENÇÃO: A restauração irá substituir os dados atuais do banco de dados pelos dados contidos no backup "${filename}".\n\nIsso pode interromper conexões temporariamente.\n\nPara confirmar, digite RESTAURAR abaixo:`
    );

    if (confirmation !== 'RESTAURAR') {
      toast.error('Restauração cancelada');
      return;
    }

    try {
      toast.loading('Iniciando restauração...', { id: 'restore-backup' });
      await api.post(`/backups/${filename}/restore`);
      toast.success('Processo de restauração iniciado em segundo plano. O sistema será atualizado em alguns instantes.', {
        id: 'restore-backup',
        duration: 5000,
      });
    } catch (error: any) {
      toast.error('Erro ao iniciar processo de restauração', { id: 'restore-backup' });
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await api.post('/backups/config', {
        auto_backup_enabled: config.auto_backup_enabled,
        backup_frequency: config.backup_frequency,
        backup_retention: config.backup_retention,
      });
      toast.success('Configurações de backup salvas com sucesso!');
      fetchBackups();
    } catch (error: any) {
      toast.error('Erro ao salvar configurações de backup');
    } finally {
      setSavingConfig(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          Gerenciamento de Backups
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie e configure cópias de segurança do banco de dados da sua aplicação de forma segura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Configurations Panel */}
        <Card className="p-6 h-fit md:col-span-1 border shadow-sm">
          <h2 className="font-semibold text-lg border-b pb-2 mb-4">Configuração Automática</h2>
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="auto_backup" className="cursor-pointer">Ativar Backup Automático</Label>
              <input
                id="auto_backup"
                type="checkbox"
                checked={config.auto_backup_enabled}
                onChange={(e) => setConfig({ ...config, auto_backup_enabled: e.target.checked })}
                className="w-4 h-4 text-primary bg-background border-input rounded"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="frequency">Frequência</Label>
              <select
                id="frequency"
                value={config.backup_frequency}
                onChange={(e) => setConfig({ ...config, backup_frequency: e.target.value })}
                disabled={!config.auto_backup_enabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <option value="daily">Diário (Todo dia às 02h UTC)</option>
                <option value="weekly">Semanal (Todo domingo às 02h UTC)</option>
                <option value="monthly">Mensal (Todo dia 1º às 02h UTC)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="retention">Retenção (Nº de backups mantidos)</Label>
              <Input
                id="retention"
                type="number"
                min="1"
                max="30"
                value={config.backup_retention}
                disabled={!config.auto_backup_enabled}
                onChange={(e) => setConfig({ ...config, backup_retention: parseInt(e.target.value) || 5 })}
              />
            </div>

            <Button type="submit" disabled={savingConfig} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Salvar Definições
            </Button>
          </form>
        </Card>

        {/* List Panel */}
        <Card className="p-6 md:col-span-2 border shadow-sm flex flex-col">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="font-semibold text-lg">Cópias Disponíveis</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchBackups} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={handleCreateBackup} disabled={creatingBackup}>
                <Play className="w-4 h-4 mr-2" />
                Criar Backup Manual
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum backup encontrado. Clique em "Criar Backup Manual" para gerar o primeiro.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Nome do Arquivo</th>
                    <th className="text-left py-2 font-medium">Tamanho</th>
                    <th className="text-left py-2 font-medium">Data de Criação</th>
                    <th className="text-right py-2 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {backups.map((file) => (
                    <tr key={file.name} className="hover:bg-muted/30">
                      <td className="py-3 font-medium text-foreground max-w-[200px] truncate" title={file.name}>
                        {file.name}
                      </td>
                      <td className="py-3 text-muted-foreground">{formatSize(file.size)}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(file.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-primary/5"
                            onClick={() => handleDownloadBackup(file.name)}
                            title="Baixar Backup"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-orange-500 hover:bg-orange-500/5 hover:text-orange-600"
                            onClick={() => handleRestoreBackup(file.name)}
                            title="Restaurar Banco de Dados"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/5"
                            onClick={() => handleDeleteBackup(file.name)}
                            title="Excluir Backup"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-6 border-t pt-4 bg-muted/10 p-3 rounded-lg flex items-start gap-3 text-xs text-muted-foreground border">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground block mb-1">Avisos importantes sobre restauração:</span>
              O processo de restauração sobrescreve completamente os dados atuais do banco de dados. Tenha certeza absoluta antes de confirmar a restauração. Para maior segurança, sempre baixe uma cópia de segurança antes de realizar uma restauração.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
