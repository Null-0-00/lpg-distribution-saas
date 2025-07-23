'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronRight,
  Brain,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { SequentialThought, SequentialThinkingResult } from '@/lib/mcp';

interface ThinkingProcessProps {
  result: SequentialThinkingResult;
  title?: string;
  showSteps?: boolean;
}

export function ThinkingProcess({
  result,
  title = 'Sequential Thinking Process',
  showSteps = true,
}: ThinkingProcessProps) {
  const [isExpanded, setIsExpanded] = useState(showSteps);
  const [expandedThoughts, setExpandedThoughts] = useState<Set<number>>(
    new Set()
  );

  const toggleThought = (thoughtNumber: number) => {
    const newExpanded = new Set(expandedThoughts);
    if (newExpanded.has(thoughtNumber)) {
      newExpanded.delete(thoughtNumber);
    } else {
      newExpanded.add(thoughtNumber);
    }
    setExpandedThoughts(newExpanded);
  };

  const getThoughtIcon = (thought: SequentialThought, isLast: boolean) => {
    if (isLast && !thought.nextThoughtNeeded) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (thought.revisionOfThought) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getProgressPercentage = () => {
    if (result.thoughts.length === 0) return 0;
    const lastThought = result.thoughts[result.thoughts.length - 1];
    return Math.round(
      (lastThought.thoughtNumber / lastThought.totalThoughts) * 100
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={result.processComplete ? 'default' : 'secondary'}>
              {result.processComplete ? 'Complete' : 'In Progress'}
            </Badge>
            <Badge variant="outline">{getProgressPercentage()}%</Badge>
          </div>
        </div>

        {result.thoughts.length > 0 && (
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {result.thoughts.length} thoughts •{' '}
            {result.processComplete ? 'Analysis complete' : 'Processing...'}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {isExpanded ? 'Hide' : 'Show'} Process
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {result.thoughts.map((thought, index) => {
              const isLast = index === result.thoughts.length - 1;
              const isExpanded = expandedThoughts.has(thought.thoughtNumber);

              return (
                <div
                  key={`${thought.thoughtNumber}-${index}`}
                  className="rounded-lg border"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
                    onClick={() => toggleThought(thought.thoughtNumber)}
                  >
                    <div className="flex items-center gap-3">
                      {getThoughtIcon(thought, isLast)}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Step {thought.thoughtNumber}
                        </span>
                        {thought.revisionOfThought && (
                          <Badge variant="outline" className="text-xs">
                            Revision of #{thought.revisionOfThought}
                          </Badge>
                        )}
                        {thought.branchFromThought && (
                          <Badge variant="outline" className="text-xs">
                            Branch from #{thought.branchFromThought}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {thought.thoughtNumber}/{thought.totalThoughts}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      <Separator />
                      <div className="bg-gray-50 p-3">
                        <p className="text-sm leading-relaxed">
                          {thought.thought}
                        </p>
                        {!thought.nextThoughtNeeded && isLast && (
                          <div className="mt-2 border-t pt-2">
                            <Badge className="bg-green-100 text-green-800">
                              Process Complete
                            </Badge>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {result.finalResult && (
          <div className="mt-6 border-t pt-4">
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Final Result
            </h4>
            <div className="rounded-lg bg-green-50 p-3">
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm">
                {JSON.stringify(result.finalResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
