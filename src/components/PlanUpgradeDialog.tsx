import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
} from "@mui/material";

interface PlanUpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmPlan: (plan: "free" | "paid") => void;
  currentPlan?: "free" | "paid";
  allowFreeSelection?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export const PlanUpgradeDialog: React.FC<PlanUpgradeDialogProps> = ({
  open,
  onClose,
  onConfirmPlan,
  currentPlan = "free",
  allowFreeSelection = true,
  isSubmitting = false,
  errorMessage = "",
}) => {
  const [selectedPlan, setSelectedPlan] = React.useState<"free" | "paid">(currentPlan);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedPlan(allowFreeSelection ? currentPlan : "paid");
  }, [open, currentPlan, allowFreeSelection]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upgrade Plan</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Choose a plan to continue. Paid plan allows downloads beyond the free monthly limit.
        </Typography>

        <Stack spacing={1.25}>
          {allowFreeSelection && (
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}>
              <FormControlLabel
                control={<Radio checked={selectedPlan === "free"} onChange={() => setSelectedPlan("free")} />}
                label="Free Plan"
              />
              <Typography variant="body2" color="text.secondary" sx={{ pl: 4.5 }}>
                Allows only 3 downloads per month.
              </Typography>
            </Box>
          )}

          <Box sx={{ border: "1px solid", borderColor: "primary.main", borderRadius: 1.5, p: 1.5 }}>
            <FormControlLabel
              control={<Radio checked={selectedPlan === "paid"} onChange={() => setSelectedPlan("paid")} />}
              label="Paid Plan"
            />
            <Typography variant="body2" color="text.secondary" sx={{ pl: 4.5 }}>
              Unlimited downloads each month. Upgrade to continue after free-plan limit.
            </Typography>
          </Box>
        </Stack>

        {errorMessage && (
          <Typography color="error" sx={{ mt: 1.5 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            border: "1.5px solid #94A3B8 !important",
            borderRadius: 1.5,
            px: 2.5,
            color: "text.primary",
            backgroundColor: "#FFFFFF !important",
            boxShadow: "inset 0 0 0 1px #94A3B8",
            "&:hover": {
              border: "1.5px solid #64748B !important",
              boxShadow: "inset 0 0 0 1px #64748B",
              backgroundColor: "#F8FAFC",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirmPlan(selectedPlan)}
          disabled={isSubmitting}
          variant="contained"
        >
          {isSubmitting ? "Saving..." : "Apply Plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
