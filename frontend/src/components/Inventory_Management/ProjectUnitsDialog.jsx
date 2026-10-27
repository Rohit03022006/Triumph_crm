import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Plus, Trash2, UserCheck, Tag, Search } from "lucide-react";
import {
  createProjectUnit,
  updateProjectUnit,
  deleteProjectUnit,
  tagUnitToLead,
} from "@/api/inventory";
import { toast } from "@/components/ui/toast";

const ProjectUnitsDialog = ({
  property,
  isOpen,
  setIsOpen,
  masterData = null,
  onUnitsUpdated,
  isAdmin = false,
}) => {
  const [units, setUnits] = useState(property?.units || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [taggingUnitId, setTaggingUnitId] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUnit, setNewUnit] = useState({
    unitName: "",
    area: "",
    areaUnit: "sq. ft.",
    price: "",
    status: "AVAILABLE",
  });

  React.useEffect(() => {
    if (property?.units) {
      setUnits(property.units);
    }
  }, [property]);

  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnit.unitName || !newUnit.area || !newUnit.price) {
      toast.warning(
        "Missing Fields",
        "Please fill in unit name, area, and price",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createProjectUnit({
        propertyId: property.id,
        data: {
          ...newUnit,
          area: Number(newUnit.area),
          price: Number(newUnit.price),
        },
      });

      setUnits((prev) => [...prev, created]);
      setShowAddForm(false);
      setNewUnit({
        unitName: "",
        area: "",
        areaUnit: "sq. ft.",
        price: "",
        status: "AVAILABLE",
      });
      toast.success("Unit added successfully");
      if (onUnitsUpdated) onUnitsUpdated();
    } catch (err) {
      toast.error("Failed to add unit", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      await deleteProjectUnit(unitId);
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      toast.success("Unit deleted successfully");
      if (onUnitsUpdated) onUnitsUpdated();
    } catch (err) {
      toast.error("Failed to delete unit", err.message);
    }
  };

  const handleTagLead = async (unitId) => {
    if (!selectedLeadId) {
      toast.warning("Selection Required", "Please select a lead to tag");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await tagUnitToLead({
        unitId,
        leadId: selectedLeadId,
      });

      setUnits((prev) => prev.map((u) => (u.id === unitId ? updated : u)));
      setTaggingUnitId(null);
      setSelectedLeadId("");
      toast.success("Lead tagged to unit successfully");
      if (onUnitsUpdated) onUnitsUpdated();
    } catch (err) {
      toast.error("Failed to tag lead", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLeads = React.useMemo(() => {
    if (!masterData?.leads) return [];
    if (!leadSearch) return masterData.leads;
    const term = leadSearch.toLowerCase();
    return masterData.leads.filter(
      (l) =>
        l.firstName?.toLowerCase().includes(term) ||
        l.lastName?.toLowerCase().includes(term) ||
        l.email?.toLowerCase().includes(term) ||
        l.phone?.includes(term),
    );
  }, [masterData?.leads, leadSearch]);

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-white rounded-xl shadow-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/60 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Project Units: {property.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage inventory units and tag them to active booking leads
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddForm((p) => !p)}
            className="bg-primary hover:bg-brand-dark text-primary-foreground text-xs rounded-lg flex items-center gap-1.5 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? "Cancel" : "Add Unit"}</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {showAddForm && (
            <form
              onSubmit={handleAddUnit}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-800">Add New Unit</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <Label className="text-[11px] text-slate-500">
                    Unit Name *
                  </Label>
                  <Input
                    placeholder="e.g. Unit 402"
                    value={newUnit.unitName}
                    onChange={(e) =>
                      setNewUnit({ ...newUnit, unitName: e.target.value })
                    }
                    className="h-8 text-xs bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500">
                    Area (sq.ft) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="1850"
                    value={newUnit.area}
                    onChange={(e) =>
                      setNewUnit({ ...newUnit, area: e.target.value })
                    }
                    className="h-8 text-xs bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500">
                    Price (₹) *
                  </Label>
                  <Input
                    type="number"
                    placeholder="25000000"
                    value={newUnit.price}
                    onChange={(e) =>
                      setNewUnit({ ...newUnit, price: e.target.value })
                    }
                    className="h-8 text-xs bg-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500">Status</Label>
                  <select
                    value={newUnit.status}
                    onChange={(e) =>
                      setNewUnit({ ...newUnit, status: e.target.value })
                    }
                    className="w-full h-8 px-2 rounded-md bg-white border border-slate-200 text-xs font-medium outline-none mt-1"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="TAGGED">Tagged</option>
                    <option value="BOOKED">Booked</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-brand-dark text-primary-foreground text-xs rounded-lg"
                >
                  {isSubmitting ? "Saving..." : "Save Unit"}
                </Button>
              </div>
            </form>
          )}

          {units.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-semibold text-slate-600">
                No units added yet
              </p>
              <p className="text-[11px] text-slate-400">
                Click "+ Add Unit" to add units to this project.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {units.map((unit) => {
                const isTaggingThis = taggingUnitId === unit.id;
                return (
                  <div
                    key={unit.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {unit.unitName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${
                            unit.status === "AVAILABLE"
                              ? "border-success/30 bg-success/10 text-success"
                              : unit.status === "TAGGED"
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-purple/30 bg-purple/10 text-purple"
                          }`}
                        >
                          {unit.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          Area: {Number(unit.area).toLocaleString()}{" "}
                          {unit.areaUnit}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-foreground">
                          ₹{Number(unit.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {unit.lead && (
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-primary font-medium">
                          <Tag className="w-3 h-3" />
                          <span>
                            Tagged to: {unit.lead.firstName}{" "}
                            {unit.lead.lastName} (
                            {unit.lead.phone || unit.lead.email})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTaggingUnitId(isTaggingThis ? null : unit.id);
                          setSelectedLeadId(unit.leadId || "");
                        }}
                        className="h-8 text-xs rounded-lg flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>
                          {unit.leadId ? "Re-tag Lead" : "Tag to Lead"}
                        </span>
                      </Button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="p-1.5 text-danger hover:bg-danger/10 rounded transition-colors"
                          title="Delete Unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {isTaggingThis && (
                      <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                        <Label className="text-[11px] font-semibold text-slate-700">
                          Select Lead to Tag
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Search lead..."
                              value={leadSearch}
                              onChange={(e) => setLeadSearch(e.target.value)}
                              className="h-8 text-xs pl-7 bg-white"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          </div>
                          <select
                            value={selectedLeadId}
                            onChange={(e) => setSelectedLeadId(e.target.value)}
                            className="h-8 px-2.5 rounded-md bg-white border border-slate-200 text-xs font-medium outline-none"
                          >
                            <option value="">-- Choose Lead --</option>
                            {filteredLeads.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.firstName} {l.lastName} (
                                {l.phone || l.email || "No contact"})
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            disabled={!selectedLeadId || isSubmitting}
                            onClick={() => handleTagLead(unit.id)}
                            className="h-8 text-xs bg-primary hover:bg-brand-dark text-primary-foreground rounded-lg"
                          >
                            Confirm Tag
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectUnitsDialog;
