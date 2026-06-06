import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAnnouncements, upsertAnnouncement } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Megaphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/announcements")({ component: AnnouncePage });

function AnnouncePage() {
  const fetchAll = useServerFn(listAnnouncements);
  const save = useServerFn(upsertAnnouncement);
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => fetchAll().then(setRows);
  useEffect(() => { load(); }, []);

  async function submit() {
    try {
      await save({ data: { ...editing, ends_at: editing.ends_at || null } });
      toast.success("Announcement saved"); setOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Megaphone className="h-6 w-6" />Announcements</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => { setEditing({ title: "", body: "", audience: "all", variant: "info", is_active: true }); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />New</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} announcement</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div><Label>Body</Label><Textarea rows={4} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Audience</Label>
                    <Select value={editing.audience} onValueChange={(v) => setEditing({ ...editing, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="vendors">Vendors only</SelectItem>
                        <SelectItem value="buyers">Buyers only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Variant</Label>
                    <Select value={editing.variant} onValueChange={(v) => setEditing({ ...editing, variant: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Ends at</Label><Input type="datetime-local" value={editing.ends_at?.slice(0,16) ?? ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} /></div>
                <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /></div>
                <Button className="w-full" onClick={submit}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3">
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">No announcements yet.</p> : rows.map((a) => (
          <Card key={a.id} className="cursor-pointer p-4" onClick={() => { setEditing(a); setOpen(true); }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold">{a.title}</h3>
              <div className="flex gap-2">
                <Badge variant="outline">{a.audience}</Badge>
                <Badge variant="outline">{a.variant}</Badge>
                {a.is_active ? <Badge>active</Badge> : <Badge variant="secondary">off</Badge>}
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
