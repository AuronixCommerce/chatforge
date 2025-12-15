// src/components/legal-dialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import PrivacyContent from "./legal/privacy-content";
import TermsContent from "./legal/terms-content";

type LegalDialogProps = {
    doc: 'terms' | 'privacy';
    children: React.ReactNode;
}

export function LegalDialog({ doc, children }: LegalDialogProps) {
    const title = doc === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
    const ContentComponent = doc === 'terms' ? TermsContent : PrivacyContent;

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        Last updated: {new Date().toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4 -mr-6">
                    <ContentComponent />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
