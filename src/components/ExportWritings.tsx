import { useState } from "react";
import { Button } from "./ui/button";
import { Archive, Download, FileText, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { TerminalSelector } from "./ui/terminal-selector";

interface ExportWritingsProps {
  spaceName?: string;
  className?: string;
  inline?: boolean;
  onClose?: () => void;
}

export function ExportWritings({ spaceName = "this space", className = "", inline = false, onClose }: ExportWritingsProps) {
  const [exportFormat, setExportFormat] = useState<"markdown" | "pdf" | "json">("markdown");
  const [includePrompts, setIncludePrompts] = useState(true);
  const [includeDates, setIncludeDates] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      // Create export content
      const content = generateExportContent();
      
      // Create blob and download
      const blob = new Blob([content], { type: getContentType() });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${spaceName.replace(/\s+/g, '-')}-writings.${getFileExtension()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsExporting(false);
      
      // Close inline view or dialog
      if (inline && onClose) {
        onClose();
      } else {
        setIsOpen(false);
      }
    }, 1500);
  };

  const generatePDF = (): string => {
    // Mock PDF content - in real implementation, use a library like jsPDF or pdfmake
    // For now, we'll return markdown-like content that would be converted to PDF
    return generateMarkdown();
  };

  const generateExportContent = (): string => {
    if (exportFormat === "markdown") {
      return generateMarkdown();
    } else if (exportFormat === "pdf") {
      return generatePDF();
    } else {
      return generateJSON();
    }
  };

  const generateMarkdown = (): string => {
    let content = `# ${spaceName}\n\n`;
    content += `Exported on ${new Date().toLocaleDateString()}\n\n`;
    content += `---\n\n`;
    
    // Sample writings - in real app, this would come from props or context
    const writings = [
      {
        week: 12,
        date: "Nov 1, 2025",
        prompt: "What moments surprised you this week?",
        content: "This week brought unexpected clarity during a morning walk...",
      },
      {
        week: 11,
        date: "Oct 25, 2025",
        prompt: "What are you grateful for today?",
        content: "I found myself grateful for small conversations...",
      },
    ];

    writings.forEach((writing) => {
      content += `## Week ${writing.week}\n\n`;
      if (includeDates) {
        content += `**Date:** ${writing.date}\n\n`;
      }
      if (includePrompts) {
        content += `**Prompt:** ${writing.prompt}\n\n`;
      }
      content += `${writing.content}\n\n`;
      content += `---\n\n`;
    });

    return content;
  };

  const generateJSON = (): string => {
    const data = {
      spaceName,
      exportedAt: new Date().toISOString(),
      writings: [
        {
          week: 12,
          date: "2025-11-01",
          prompt: includePrompts ? "What moments surprised you this week?" : undefined,
          content: "This week brought unexpected clarity during a morning walk...",
        },
        {
          week: 11,
          date: "2025-10-25",
          prompt: includePrompts ? "What are you grateful for today?" : undefined,
          content: "I found myself grateful for small conversations...",
        },
      ],
      options: {
        includePrompts,
        includeDates,
      },
    };

    return JSON.stringify(data, null, 2);
  };

  const getContentType = (): string => {
    switch (exportFormat) {
      case "markdown":
        return "text/markdown";
      case "pdf":
        return "application/pdf";
      case "json":
        return "application/json";
      default:
        return "text/plain";
    }
  };

  const getFileExtension = (): string => {
    switch (exportFormat) {
      case "markdown":
        return "md";
      case "pdf":
        return "pdf";
      case "json":
        return "json";
      default:
        return "txt";
    }
  };

  // Render export options content
  const renderExportOptions = () => (
    <>
      <div className={inline ? "space-y-6" : "space-y-6"}>
        {/* Format Selection */}
        <div className="space-y-3">
          <TerminalSelector
            label="Export Format"
            options={[
              { value: "markdown", label: "Markdown" },
              { value: "json", label: "JSON" },
              { value: "pdf", label: "PDF" }
            ]}
            value={exportFormat}
            onChange={(value) => setExportFormat(value as "markdown" | "pdf" | "json")}
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label className="text-sm font-normal">Include Options</Label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setIncludePrompts(!includePrompts)}
              className="flex items-center gap-3 py-2 cursor-pointer group w-full text-left"
            >
              <div 
                className={`w-4 h-4 border-2 rounded transition-all flex items-center justify-center ${
                  includePrompts 
                    ? 'bg-foreground border-foreground' 
                    : 'border-border group-hover:border-foreground/50'
                }`}
              >
                {includePrompts && (
                  <svg
                    className="w-3 h-3 text-background"
                    fill="none"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm group-hover:text-foreground transition-colors">
                Weekly prompts
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setIncludeDates(!includeDates)}
              className="flex items-center gap-3 py-2 cursor-pointer group w-full text-left"
            >
              <div 
                className={`w-4 h-4 border-2 rounded transition-all flex items-center justify-center ${
                  includeDates 
                    ? 'bg-foreground border-foreground' 
                    : 'border-border group-hover:border-foreground/50'
                }`}
              >
                {includeDates && (
                  <svg
                    className="w-3 h-3 text-background"
                    fill="none"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span className="text-sm group-hover:text-foreground transition-colors">
                Dates and timestamps
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className={`flex gap-3 ${inline ? 'pt-6' : 'pt-6'}`}>
        {inline && (
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className={`${inline ? 'flex-1' : 'w-full'} gap-2`}
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>
    </>
  );

  // If inline mode, render just the options
  if (inline) {
    return (
      <div className={className}>
        {renderExportOptions()}
      </div>
    );
  }

  // Otherwise, render as dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`w-full justify-start gap-2 ${className}`}>
          <Archive className="w-4 h-4" />
          Export Writings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Export Your Writings</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Download all your writings from {spaceName}
          </DialogDescription>
        </DialogHeader>
        <div className="border-t pt-4">
          {renderExportOptions()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
