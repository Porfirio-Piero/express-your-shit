"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Prediction, CATEGORIES } from "@/types";
import { Crown, Frown, Trash2, Calendar } from "lucide-react";

interface PredictionCardProps {
  prediction: Prediction;
  onDelete: (id: string) => void;
  index: number;
}

export function PredictionCard({ prediction, onDelete, index }: PredictionCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const category = CATEGORIES.find(c => c.value === prediction.category);
  const date = new Date(prediction.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`border-l-4 ${
        prediction.normWasRight 
          ? "border-l-green-500" 
          : "border-l-red-500"
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {prediction.normWasRight ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <Crown className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                  <Frown className="w-5 h-5 text-red-600" />
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {date}
                </p>
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category.emoji} {category.label}
                  </Badge>
                )}
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    🤨 Are you doubting Norm?
                  </DialogTitle>
                  <DialogDescription>
                    Norm&apos;s predictions are eternal... but you can delete this one if you must.
                    <br />
                    <span className="text-red-500 font-medium">
                      Norm will remember this.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Nevermind, Norm is right
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      onDelete(prediction.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    Yes, delete it 😢
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="bg-violet-50 rounded-lg p-3">
            <p className="text-xs text-violet-600 font-medium mb-1">🔮 Norm claims...</p>
            <p className="text-sm text-gray-800">{prediction.claim}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">🌍 Reality said...</p>
            <p className="text-sm text-gray-800">{prediction.outcome}</p>
          </div>
          
          <div className="flex items-center justify-center py-2">
            <Badge 
              className={prediction.normWasRight 
                ? "text-sm px-4 py-1 bg-green-500 text-white hover:bg-green-600" 
                : "text-sm px-4 py-1 bg-red-500 text-white hover:bg-red-600"
              }
            >
              {prediction.normWasRight ? (
                <><Crown className="w-4 h-4 mr-1 inline" /> Norm was RIGHT!</>
              ) : (
                <><Frown className="w-4 h-4 mr-1 inline" /> Norm was wrong...</>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
