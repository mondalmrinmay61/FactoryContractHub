import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Milestone form schema
const milestoneSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  amount: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  dueDate: z.date().optional(),
  order: z.string().refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "Order must be a non-negative number" }
  ),
});

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface MilestoneFormProps {
  contractId: number;
  onSuccess?: () => void;
  initialData?: Partial<MilestoneFormValues>;
  isEdit?: boolean;
  milestoneId?: number;
}

export function MilestoneForm({ 
  contractId, 
  onSuccess,
  initialData,
  isEdit = false,
  milestoneId
}: MilestoneFormProps) {
  const { toast } = useToast();
  
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      amount: initialData?.amount?.toString() || "",
      dueDate: initialData?.dueDate,
      order: initialData?.order?.toString() || "0",
    },
  });
  
  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: MilestoneFormValues) => {
      const res = await apiRequest("POST", `/api/contracts/${contractId}/milestones`, {
        title: data.title,
        description: data.description,
        amount: Number(data.amount),
        dueDate: data.dueDate,
        order: Number(data.order),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone created",
        description: "The milestone has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/milestones`] });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create milestone",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: async (data: MilestoneFormValues) => {
      const res = await apiRequest("PATCH", `/api/milestones/${milestoneId}`, {
        title: data.title,
        description: data.description,
        amount: Number(data.amount),
        dueDate: data.dueDate,
        order: Number(data.order),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Milestone updated",
        description: "The milestone has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/milestones`] });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update milestone",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const mutation = isEdit ? updateMilestoneMutation : createMilestoneMutation;
  
  const onSubmit = (data: MilestoneFormValues) => {
    mutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Initial Design Phase" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what this milestone includes..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Clearly describe the deliverables and requirements for this milestone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1000.00" 
                    min="0" 
                    step="0.01" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Payment amount for this milestone
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    min="0" 
                    step="1" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Sequence number (0, 1, 2...)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Optional. When this milestone is due to be completed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-brand hover:bg-brand-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Save Changes" : "Create Milestone"}
          </Button>
        </div>
      </form>
    </Form>
  );
}