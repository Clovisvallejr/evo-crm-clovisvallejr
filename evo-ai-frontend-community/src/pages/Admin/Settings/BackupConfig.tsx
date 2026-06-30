import { useState, useEffect } from 'react';
import { 
  Button,
  Label,
  Input,
  Switch,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@evoapi/design-system';
import { Download, DatabaseBackup, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/core/api';

interface Backup {
  id: string;
  name: string;
  size: number;
  created_at: string;
}

export default function BackupConfig() {
  // removed unused t translation hook
  const [backups, setBackups] = useState<Backup[]>([]);
  const [autoBackup, setAutoBackup] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('03:00');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await api.get('/admin/backups');
      setBackups(response.data.backups);
      setAutoBackup(response.data.config.auto_backup_enabled);
      setScheduleTime(response.data.config.schedule_time || '03:00');
    } catch (error) {
      toast.error('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  const generateBackup = async () => {
    setGenerating(true);
    try {
      await api.post('/admin/backups');
      toast.success('Backup iniciado em background. Atualize a página em alguns minutos.');
    } catch (error) {
      toast.error('Erro ao iniciar backup');
    } finally {
      setGenerating(false);
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      await api.post('/admin/backups/schedule', {
        auto_backup_enabled: autoBackup,
        schedule_time: scheduleTime
      });
      toast.success('Configuração de backup atualizada com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setSavingConfig(false);
    }
  };

  const downloadBackup = (id: string) => {
    window.open(`${api.defaults.baseURL}/admin/backups/${id}/download`, '_blank');
  };

  const deleteBackup = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este backup?')) return;
    try {
      await api.delete(`/admin/backups/${id}`);
      toast.success('Backup excluído');
      fetchBackups();
    } catch (error) {
      toast.error('Erro ao excluir backup');
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Backup & Restauração</h2>
        <p className="text-muted-foreground">
          Gerencie os backups do sistema, mídias e conversas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <DatabaseBackup className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-lg font-medium">Backup Manual</h3>
              <p className="text-sm text-muted-foreground">
                Gere um backup completo agora mesmo. O processo rodará em background.
              </p>
            </div>
          </div>
          <Button onClick={generateBackup} disabled={generating} className="w-full mt-4">
            {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {generating ? 'Iniciando...' : 'Gerar Novo Backup Agora'}
          </Button>
        </div>

        <div className="space-y-4 rounded-lg border p-6">
          <div>
            <h3 className="text-lg font-medium">Agendamento Automático</h3>
            <p className="text-sm text-muted-foreground">
              Configure o backup para rodar diariamente em um horário específico.
            </p>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoBackup">Ativar Backup Automático</Label>
              <Switch
                id="autoBackup"
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Horário (Diário)</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={scheduleTime}
                onChange={(e: any) => setScheduleTime(e.target.value)}
                disabled={!autoBackup}
              />
            </div>

            <Button onClick={saveConfig} disabled={savingConfig || (!autoBackup && !scheduleTime)} variant="outline" className="w-full">
              {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Backups (Máximo 5)</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum backup gerado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">{backup.name}</TableCell>
                    <TableCell>{formatBytes(backup.size)}</TableCell>
                    <TableCell>{formatDate(backup.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadBackup(backup.id)}
                          title="Baixar Backup"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteBackup(backup.id)}
                          title="Excluir Backup"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
