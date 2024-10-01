"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { ScrollArea } from "../components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { ChevronDown, ChevronUp, MoreHorizontal, X, Link, ArrowRightLeft, MessageSquare, Pencil, Trash  } from "lucide-react"
import VisibilityDashboard from "./VisibilityDashboard"
import * as Tooltip from '@radix-ui/react-tooltip';
import { Badge } from "../components/ui/badge"
import HighlightedText from './HighlightedText';
import GapAnalysis from "./GapAnalysis"
import CitationsAnalysis from "./CitationsAnalysis"
import { initialKeywords } from './data/initialKeywords';
import { initialCompetitors } from './data/initialCompetitors';
import IntentIcon from './IntentIcon';
import MentionsPopover from './MentionsPopover';
import { Card, CardContent } from "../components/ui/card"
import { BarChart2, TrendingUp, FileText } from "lucide-react"
import NextLink from "next/link"

interface Competitor {
  id: number;
  names: string[];
  color: string;
}

interface Keyword {
  id: number;
  keyword: string;
  intent: string;
  url: string;
  impressions: number;
  clicks: number;
  chatGPT: string;
  brandMention: string;
  competitorMentions: number;
  citations: { id: number; url: string }[];
}

// Define escapeRegExp function
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
};

export default function KeywordAnalytics() {
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [competitors, setCompetitors] = useState<Competitor[]>(initialCompetitors)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<keyof Keyword | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [newCompetitor, setNewCompetitor] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<Keyword | null>(null)
  const conversationPaneRef = useRef<HTMLDivElement>(null)

  // Update brand mentions
  const [brandMentions, setBrandMentions] = useState<string[]>(['Nike', 'Nike.com']);
  const [brandMentionsInput, setBrandMentionsInput] = useState<string>('Nike, Nike.com');

  const [visibleCompetitors, setVisibleCompetitors] = useState<string[]>([]);

  const [activeView, setActiveView] = useState("overview")

  const handleSort = (column: keyof Keyword) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (sortColumn) {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      // Add handling for other data types if necessary
    }
    return 0;
  });

  const filteredKeywords = sortedKeywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddKeyword = () => {
    if (newKeyword.trim() !== "") {
      const newKeywordObject: Keyword = {
        id: keywords.length + 1,
        keyword: newKeyword.trim(),
        intent: "I", // Default intent for new keywords
        url: "", // Added URL property
        impressions: 0,
        clicks: 0,
        chatGPT: "No conversation yet...",
        brandMention: "No",
        competitorMentions: 0,
        citations: []
      }
      setKeywords([...keywords, newKeywordObject])
      setNewKeyword("")
    }
  }


  const countMentions = useCallback((text: string, mentions: string[]) => {
    const lowerText = text.toLowerCase();
    return mentions.reduce((count, mention) => {
      const regex = new RegExp(escapeRegExp(mention.toLowerCase()), 'g');
      const matches = lowerText.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }, []);

  const countCompetitorMentions = useCallback(
    (text: string, competitors: Competitor[]) => {
      const allCompetitorNames = competitors.flatMap(c => c.names);
      return countMentions(text, allCompetitorNames);
    },
    [countMentions]
  );

  useEffect(() => {
    const updatedKeywords = keywords.map(keyword => ({
      ...keyword,
      competitorMentions: countCompetitorMentions(keyword.chatGPT, competitors)
    }));
    
    // Only update keywords if there are changes
    if (JSON.stringify(updatedKeywords) !== JSON.stringify(keywords)) {
      setKeywords(updatedKeywords);
    }
  }, [countCompetitorMentions, keywords, competitors]);
  

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() !== "") {
      const newCompetitorNames = newCompetitor.split(',').map(c => c.trim()).filter(c => c !== "");
      const newCompetitorObject: Competitor = {
        id: competitors.length + 1,
        names: newCompetitorNames,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      };
      setCompetitors(prevCompetitors => [...prevCompetitors, newCompetitorObject]);
      setNewCompetitor("");
    }
  };

  const handleRemoveCompetitor = (competitorId: number) => {
    setCompetitors(prevCompetitors => prevCompetitors.filter(c => c.id !== competitorId));
  };
  const getBrandMentions = (text: string) => {
    return Array.from(new Set(brandMentions.filter(brand => 
      text.toLowerCase().includes(brand.toLowerCase())
    )));
  };

  const getCompetitorMentions = (text: string) => {
    return Array.from(new Set(competitors.flatMap(c => c.names).filter(name => 
      text.toLowerCase().includes(name.toLowerCase())
    )));
  };

  const SortIcon = ({ column }: { column: keyof Keyword }) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )
  }
  

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (conversationPaneRef.current && !conversationPaneRef.current.contains(event.target as Node)) {
        setSelectedConversation(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBrandMentionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setBrandMentionsInput(newValue);
    
    // Only update brandMentions when the input is valid
    if (newValue.trim() !== '') {
      const newBrandMentions = newValue.split(',').map(s => s.trim()).filter(s => s !== '');
      setBrandMentions(newBrandMentions);
      
      // Update keywords to recalculate brand mentions
      const updatedKeywords = keywords.map(keyword => ({
        ...keyword,
        brandMention: hasBrandMention(keyword.chatGPT, newBrandMentions) ? 'Yes' : 'No'
      }));
      setKeywords(updatedKeywords);
    }
  };

  const hasBrandMention = (text: string, brandMentions: string[]): boolean => {
    const lowerText = text.toLowerCase();
    return brandMentions.some(brand => 
      lowerText.includes(brand.toLowerCase())
    );
  };

  const handleVisibleCompetitorsChange = (newVisibleCompetitors: string[]) => {
    setVisibleCompetitors(newVisibleCompetitors);
  };

  const countCitations = (text: string) => {
    const citationRegex = /\[\d+\]/g;
    const matches = text.match(citationRegex);
    return matches ? matches.length : 0;
  }

  // Update this function to include all competitor names
  const getAllCompetitorNames = () => {
    const names = competitors.flatMap(c => c.names);
    console.log('Competitor names:', names);
    return names;
  };

  const renderTextWithCitations = (text: string, citations: { id: number, url: string }[]) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationId = parseInt(match[1]);
        const citation = citations.find(c => c.id === citationId);
        if (citation) {
          const truncatedUrl = citation.url.length > 30 ? citation.url.substring(0, 30) + '...' : citation.url;
          return (
            <Tooltip.Provider key={index}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <a href={citation.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-500 hover:text-blue-700">
                    <Link className="h-3 w-3 ml-1" />
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                    sideOffset={5}
                  >
                    {truncatedUrl}
                    <Tooltip.Arrow className="fill-gray-100" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        }
      }
      const competitorNames = getAllCompetitorNames();
      console.log('Rendering HighlightedText with:', { part, brandMentions, competitorNames });
      return (
        <HighlightedText
          key={index}
          text={part}
          brandMentions={brandMentions}
          competitorMentions={competitorNames}
        />
      );
    });
  }

  const truncateUrl = (url: string, maxLength: number = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + '...';
  };

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case 'I':
        return 'Informational';
      case 'N':
        return 'Navigational';
      case 'T':
        return 'Transactional';
      case 'C':
        return 'Commercial';
      default:
        return 'Unknown';
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return (
          <>
            <div className="mb-4">
              <VisibilityDashboard 
                competitors={competitors.map(c => ({ name: c.names[0], color: c.color }))}
                visibleCompetitors={visibleCompetitors}
                onVisibleCompetitorsChange={handleVisibleCompetitorsChange}
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <Input
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogTrigger asChild>
                  <Button>Manage</Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Manage Keywords and Competitors</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-keyword" className="text-right">
                        New Keyword
                      </Label>
                      <Input
                        id="new-keyword"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        className="col-span-2"
                      />
                      <Button onClick={handleAddKeyword} size="sm">Add</Button>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="new-competitor" className="text-right">
                        New Competitor
                      </Label>
                      <Input
                        id="new-competitor"
                        value={newCompetitor}
                        onChange={(e) => setNewCompetitor(e.target.value)}
                        className="col-span-2"
                      />
                      <Button onClick={handleAddCompetitor} size="sm">Add</Button>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brand-mentions" className="text-right">
                        Brand Mentions
                      </Label>
                      <Input
                        id="brand-mentions"
                        value={brandMentionsInput}
                        onChange={handleBrandMentionsChange}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Existing Competitors</h3>
                      <div className="grid gap-2">
                        {competitors.map((competitor) => (
                          <div key={competitor.id} className="flex items-center justify-between">
                            <span>{competitor.names.join(', ')}</span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCompetitor(competitor.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex rounded-lg shadow-md overflow-hidden mt-6">
              <div className={`w-full ${selectedConversation ? 'lg:w-2/3' : ''} transition-all duration-300 ease-in-out`}>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead className="w-1/6">
                          <Button variant="ghost" onClick={() => handleSort("keyword")} className="font-semibold">
                            Keyword <SortIcon column="keyword" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-1/12">Intent</TableHead>
                        <TableHead className="w-1/6">URL</TableHead>
                        <TableHead className="w-1/12">
                          <Button variant="ghost" onClick={() => handleSort("impressions")} className="font-semibold">
                            Imp. <SortIcon column="impressions" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-1/12">
                          <Button variant="ghost" onClick={() => handleSort("clicks")} className="font-semibold">
                            Clicks <SortIcon column="clicks" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-1/6">ChatGPT Conversation</TableHead>
                        <TableHead className="w-1/12">
                          <Button variant="ghost" onClick={() => handleSort("brandMention")} className="font-semibold">
                            Brand <SortIcon column="brandMention" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-1/12">
                          <Button variant="ghost" onClick={() => handleSort("competitorMentions")} className="font-semibold">
                            Comp. <SortIcon column="competitorMentions" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-1/12">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((item, index) => (
                        <TableRow 
                          key={item.id} 
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <TableCell className="font-medium">{item.keyword}</TableCell>
                          <TableCell>
                            <IntentIcon intent={item.intent} />
                          </TableCell>
                          <TableCell>
                            {item.url ? (
                              <NextLink href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {truncateUrl(item.url, 20)}
                              </NextLink>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{item.impressions.toLocaleString()}</TableCell>
                          <TableCell>{item.clicks.toLocaleString()}</TableCell>
                          <TableCell 
                            className="max-w-xs truncate cursor-pointer" 
                            title={item.chatGPT}
                            onClick={() => setSelectedConversation(item)}
                          >
                            {item.chatGPT.substring(0, 50)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.brandMention === 'Yes' ? 'outline' : 'secondary'}>
                              {item.brandMention}
                            </Badge>
                          </TableCell>
                          <TableCell>
  <Badge variant={item.competitorMentions > 0 ? 'destructive' : 'secondary'}>
    {item.competitorMentions}
  </Badge>
</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedConversation(item)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  View Conversation
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                                  Compare
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              {selectedConversation && (
                <div ref={conversationPaneRef} className="hidden lg:block lg:w-1/3 border-l border-gray-200 bg-white overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">{selectedConversation.keyword}</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedConversation(null)}
                          aria-label="Close conversation pane"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm mb-3">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <IntentIcon intent={selectedConversation.intent} />
                          {getIntentLabel(selectedConversation.intent)}
                        </Badge>
                        <Badge variant="outline">
                          Imp: {selectedConversation.impressions.toLocaleString()}
                        </Badge>
                        <Badge variant="outline">
                          Clicks: {selectedConversation.clicks.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="text-sm mb-3">
                        <span className="font-medium text-gray-500 mr-2">URL:</span>
                        <a href={selectedConversation.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                          {truncateUrl(selectedConversation.url, 40)}
                        </a>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <MentionsPopover 
                          title="Brand Mentions" 
                          count={countMentions(selectedConversation.chatGPT, brandMentions)}
                          content={
                            <ul className="list-disc pl-4">
                              {getBrandMentions(selectedConversation.chatGPT).map((mention, index) => (
                                <li key={index}>{mention}</li>
                              ))}
                            </ul>
                          }
                        />
                        <MentionsPopover 
                          title="Competitor Mentions" 
                          count={countCompetitorMentions(selectedConversation.chatGPT, competitors)}
                          content={
                            <ul className="list-disc pl-4">
                              {getCompetitorMentions(selectedConversation.chatGPT).map((mention, index) => (
                                <li key={index}>{mention}</li>
                              ))}
                            </ul>
                          }
                        />
                        <MentionsPopover 
                          title="Citations" 
                          count={countCitations(selectedConversation.chatGPT)}
                          content={
                            <ul className="list-disc pl-4 text-xs space-y-1">
                              {selectedConversation.citations.map((citation, index) => (
                                <li key={index}>
                                  <a 
                                    href={citation.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-500 hover:underline"
                                    title={citation.url}
                                  >
                                    {truncateUrl(citation.url, 35)}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4 text-sm">
                          {renderTextWithCitations(selectedConversation.chatGPT, selectedConversation.citations)}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )
      case "gap":
        return <GapAnalysis />
      case "citations":
        return <CitationsAnalysis />
      default:
        return null
    }
  }

  return (
    <Tooltip.Provider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center py-8">
        <div className="w-full max-w-6xl px-4">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Keyword Analytics</h1>
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-0">
              <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                <TabsList className="w-full justify-center bg-gray-100 p-1 rounded-t-lg">
                  <TabsTrigger 
                    value="overview"
                    className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gap"
                    className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Gap Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="citations"
                    className="flex-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Citations
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  )
}