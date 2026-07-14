import { useParams, Link } from "wouter";
import { useGetRequest, useUpdateRequestStatus, getGetRequestQueryKey, getListRequestsQueryKey } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { DepartmentBadge, StatusBadge, PriorityBadge, ConfidenceMeter } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ArrowLeft, User, Phone, Calendar, MessageSquare, BrainCircuit, Activity, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RequestStatusUpdateStatus } from "@workspace/api-client-react";

export default function RequestDetail() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: request, isLoading, isError } = useGetRequest(id, { query: { enabled: !!id } });
  const updateStatus = useUpdateRequestStatus();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
        <h2 className="text-xl font-semibold">Murojaat topilmadi</h2>
        <Link href="/requests">
          <Button variant="link" className="mt-4">Ro'yxatga qaytish</Button>
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: RequestStatusUpdateStatus) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetRequestQueryKey(id), data);
          queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
          toast({
            title: "Holat yangilandi",
            description: "Murojaat holati muvaffaqiyatli o'zgartirildi.",
          });
        },
        onError: () => {
          toast({
            title: "Xatolik",
            description: "Holatni yangilashda xatolik yuz berdi.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/requests">
          <Button variant="outline" size="icon" className="shrink-0 rounded-full h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Murojaat #{request.id}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(request.createdAt), "d MMMM yyyy, HH:mm")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 mr-4">
            {request.priority && <PriorityBadge priority={request.priority} className="text-sm px-3 py-1" />}
            <StatusBadge status={request.status} className="text-sm px-3 py-1" />
          </div>
          
          <Select 
            value={request.status} 
            onValueChange={(val) => handleStatusChange(val as RequestStatusUpdateStatus)}
            disabled={updateStatus.isPending}
          >
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder="Holatni o'zgartirish" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Yangi</SelectItem>
              <SelectItem value="in_progress">Jarayonda</SelectItem>
              <SelectItem value="resolved">Hal etilgan</SelectItem>
              <SelectItem value="closed">Yopilgan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Murojaat mazmuni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-lg text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {request.text}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <BrainCircuit className="h-5 w-5" />
                AI Tahlili
              </CardTitle>
              <CardDescription>Tizim tomonidan avtomatik aniqlangan xususiyatlar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Yo'naltirilgan bo'lim</p>
                  <DepartmentBadge department={request.department} label={request.departmentLabel} className="text-base px-3 py-1.5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Ishonch darajasi</p>
                  <ConfidenceMeter score={request.confidence} className="pt-2" />
                </div>
              </div>
              
              {request.reasoning && (
                <>
                  <Separator className="bg-primary/10" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Asoslash</p>
                    <p className="text-sm text-foreground bg-background/60 p-4 rounded-md border border-primary/10 leading-relaxed">
                      {request.reasoning}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Murojaatchi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">F.I.SH</p>
                <p className="font-medium">{request.fullName}</p>
              </div>
              
              {request.contactInfo && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Aloqa
                    </p>
                    <p className="font-medium text-sm">{request.contactInfo}</p>
                  </div>
                </>
              )}

              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Sana
                </p>
                <p className="font-medium text-sm">{format(new Date(request.createdAt), "dd.MM.yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
