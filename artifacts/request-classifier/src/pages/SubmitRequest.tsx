import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRequest, getListRequestsQueryKey, getGetRequestStatsQueryKey } from "@/hooks/api";
import { useQueryClient } from "@tanstack/react-query";
import { DepartmentBadge, ConfidenceMeter } from "@/components/Badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, CheckCircle, BrainCircuit, CornerDownRight, RefreshCcw, Zap, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import type { Request } from "@workspace/api-client-react";

const formSchema = z.object({
  fullName: z.string().min(2, "Familiya va ism kamida 2 ta harfdan iborat bo'lishi kerak"),
  contactInfo: z.string().optional(),
  text: z.string().min(10, "Murojaat matni kamida 10 ta belgidan iborat bo'lishi kerak"),
});

export default function SubmitRequest() {
  const queryClient = useQueryClient();
  const createRequest = useCreateRequest();
  const [result, setResult] = useState<Request | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      contactInfo: "",
      text: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitError(null);
    createRequest.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setResult(data);
          queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRequestStatsQueryKey() });
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            "Murojaat yuborishda xatolik yuz berdi. Qayta urinib ko'ring.";
          setSubmitError(msg);
        },
      }
    );
  }

  function handleReset() {
    form.reset();
    setResult(null);
    setSubmitError(null);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Yangi murojaat yuborish</h1>
        <p className="text-muted-foreground">Murojaat matnini kiriting. Sun'iy intellekt uni avtomatik tahlil qilib, kerakli bo'limga yo'naltiradi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className={`transition-all duration-700 ease-in-out md:col-span-12 ${result ? 'md:col-span-7' : ''}`}>
          <Card className={`shadow-sm border-border/50 relative overflow-hidden ${result ? 'opacity-50 pointer-events-none grayscale-[50%]' : ''}`}>
            {createRequest.isPending && (
              <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <BrainCircuit className="h-12 w-12 text-primary animate-pulse mb-4" />
                <h3 className="text-lg font-semibold text-foreground">AI tahlil qilmoqda...</h3>
                <p className="text-sm text-muted-foreground">Matn ma'nosi va yo'nalishi aniqlanmoqda</p>
              </div>
            )}
            
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>F.I.SH</FormLabel>
                          <FormControl>
                            <Input placeholder="Abdullayev Alisher" {...field} className="bg-muted/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aloqa uchun (Ixtiyoriy)</FormLabel>
                          <FormControl>
                            <Input placeholder="+998 90 123 45 67 yoki email" {...field} className="bg-muted/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Murojaat matni</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Murojaat mazmunini batafsil yozing..." 
                            className="min-h-[150px] resize-y bg-muted/50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {submitError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={createRequest.isPending}>
                    {createRequest.isPending ? "Yuborilmoqda..." : "Yuborish"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {result && (
          <div className="md:col-span-5 animate-in slide-in-from-right-8 duration-700 fade-in">
            <Card className="shadow-lg border-primary/20 bg-primary/5 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Zap size={20} className="fill-primary/20" />
                  <CardTitle className="text-lg">AI Xulosasi</CardTitle>
                </div>
                <CardDescription className="text-foreground/80">Murojaat muvaffaqiyatli tahlil qilindi va tizimga kiritildi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-1">
                
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Yo'naltirildi:</span>
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border shadow-sm">
                    <CornerDownRight className="text-muted-foreground h-5 w-5" />
                    <DepartmentBadge department={result.department} label={result.departmentLabel} className="text-sm px-3 py-1" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ishonch darajasi:</span>
                  <div className="p-4 bg-background rounded-lg border border-border shadow-sm space-y-3">
                    <ConfidenceMeter score={result.confidence} className="w-full" />
                    {result.reasoning && (
                      <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-3">
                        <span className="font-medium text-foreground">Asoslash:</span> {result.reasoning}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium p-3 bg-status-resolved/10 text-status-resolved rounded-lg border border-status-resolved/20">
                  <CheckCircle className="h-5 w-5" />
                  Murojaat raqami: #{result.id}
                </div>

              </CardContent>
              <CardFooter className="flex gap-3 pt-4 border-t border-border/50 bg-background/50">
                <Button variant="outline" className="flex-1 bg-background" onClick={handleReset}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Yangi
                </Button>
                <Link href={`/requests/${result.id}`} className="flex-1">
                  <Button className="w-full">
                    Ko'rish
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
