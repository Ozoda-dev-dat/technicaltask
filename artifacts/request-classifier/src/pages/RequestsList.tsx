import { useState } from "react";
import { Link } from "wouter";
import { useListRequests } from "@/hooks/api";
import { DepartmentBadge, StatusBadge, PriorityBadge, ConfidenceMeter } from "@/components/Badges";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Search, SlidersHorizontal, InboxIcon, ChevronRight } from "lucide-react";

export default function RequestsList() {
  const [department, setDepartment] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const params: any = {};
  if (department !== "all") params.department = department;
  if (status !== "all") params.status = status;

  const { data: requests, isLoading, isError } = useListRequests(params);

  const filteredRequests = requests?.filter(r => 
    r.text.toLowerCase().includes(search.toLowerCase()) || 
    r.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toString() === search
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Murojaatlar ro'yxati</h1>
          <p className="text-muted-foreground">Barcha kelib tushgan va tahlil qilingan murojaatlar</p>
        </div>
      </div>

      <Card className="p-4 shadow-sm border-border/50 flex flex-col sm:flex-row gap-4 items-center bg-card">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ID, ism yoki matn bo'yicha qidiruv..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted/30 border-border"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-[180px] bg-muted/30">
              <SelectValue placeholder="Bo'lim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha bo'limlar</SelectItem>
              <SelectItem value="hr">Kadrlar bo'limi</SelectItem>
              <SelectItem value="it">AT bo'limi</SelectItem>
              <SelectItem value="finance">Moliya</SelectItem>
              <SelectItem value="legal">Huquqiy</SelectItem>
              <SelectItem value="complaints">Shikoyatlar</SelectItem>
              <SelectItem value="general">Umumiy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[150px] bg-muted/30">
              <SelectValue placeholder="Holat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha holatlar</SelectItem>
              <SelectItem value="new">Yangi</SelectItem>
              <SelectItem value="in_progress">Jarayonda</SelectItem>
              <SelectItem value="resolved">Hal etilgan</SelectItem>
              <SelectItem value="closed">Yopilgan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">ID & Sana</th>
                <th className="px-6 py-4 font-medium">Murojaatchi</th>
                <th className="px-6 py-4 font-medium">Yo'nalish / Ishonch</th>
                <th className="px-6 py-4 font-medium">Holat / Muhimlik</th>
                <th className="px-6 py-4 font-medium text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-3 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-2 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 mb-2" /><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Ma'lumotlarni yuklashda xatolik yuz berdi.
                  </td>
                </tr>
              ) : filteredRequests?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <InboxIcon className="h-12 w-12 opacity-20 mb-3" />
                      <p>Murojaatlar topilmadi.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests?.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">#{req.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">{format(new Date(req.createdAt), 'dd.MM.yyyy HH:mm')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{req.fullName}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={req.text}>
                        {req.text}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2">
                        <DepartmentBadge department={req.department} label={req.departmentLabel} />
                      </div>
                      <ConfidenceMeter score={req.confidence} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <StatusBadge status={req.status} />
                        {req.priority && <PriorityBadge priority={req.priority} />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/requests/${req.id}`}>
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors cursor-pointer">
                          <ChevronRight size={20} />
                        </div>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
