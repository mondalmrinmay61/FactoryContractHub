import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const bidSchema = z.object({
  amount: z.number().positive("Bid amount must be a positive number"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  deliveryTime: z.string().min(2, "Delivery time is required"),
});

type BidFormValues = z.infer<typeof bidSchema>;

interface BidFormProps {
  projectId: number;
  onBidSubmitted?: () => void;
}

export function BidForm({ projectId, onBidSubmitted }: BidFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      deliveryTime: "",
    },
  });
  
  const createBid = useMutation({
    mutationFn: async (data: BidFormValues) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/bids`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/bids`] });
      queryClient.invalidateQueries({ queryKey: [`/api/contractors/${user?.id}/bids`] });
      
      toast({
        title: "Bid Submitted",
        description: "Your bid has been submitted successfully.",
      });
      
      form.reset();
      
      if (onBidSubmitted) {
        onBidSubmitted();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: BidFormValues) => {
    createBid.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bid Amount ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 5000" 
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>
                Enter your total bid amount in USD
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="deliveryTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Time</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 3 weeks" {...field} />
              </FormControl>
              <FormDescription>
                How long will it take you to complete this project?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bid Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your approach to the project, your qualifications, and why the client should choose you" 
                  className="resize-none" 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide details about how you plan to execute the project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={createBid.isPending}
          >
            {createBid.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : "Submit Bid"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
