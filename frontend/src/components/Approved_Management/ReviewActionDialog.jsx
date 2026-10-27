import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Send } from "lucide-react";

const ReviewActionDialog = ({
  isOpen,
  onClose,
  property,
  onSubmitFeedback,
  isPending,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitFeedback(property?.id, reason.trim());
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-w-3xl p-6 bg-white rounded-xl shadow-lg border">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-amber-700">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Request Revisions / Feedback
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-slate-500">
            Provide guidance or required changes for{" "}
            <span className="font-semibold text-slate-800">
              "{property?.title}"
            </span>
            . This feedback will be recorded in the audit log and visible to the
            executive.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Feedback / Reason for Revision
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Please update the carpet area certificate, verify facing direction, or re-upload higher resolution layouts."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="text-sm h-9.5 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !reason.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold h-9.5 px-4 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {isPending ? "Submitting..." : "Send Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewActionDialog;

