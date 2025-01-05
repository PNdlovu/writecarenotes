import { Metadata } from 'next'
import { MarketingNavbar } from '@/components/marketing/Navbar'
import { MarketingFooter } from '@/components/marketing/Footer'
import { Button } from '@/components/ui/Button/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Download, FileText, Palette, Type, Image as ImageIcon } from 'lucide-react'
import { brandAssets } from '@/config/brand-assets'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge/Badge'
import { Check, X, Circle } from 'lucide-react'
import { Linkedin, Twitter } from 'lucide-react'
import { Input } from '@/components/ui/Form/Input'
import { Label } from '@/components/ui/Form/Label'

export const metadata: Metadata = {
  title: 'Brand Guidelines | Write Care Notes',
  description: 'Official brand guidelines and assets for Write Care Notes. Access our comprehensive brand guidelines, logos, and design resources.',
}

function AssetDownloadCard({
  title,
  description,
  downloadUrl,
  icon: Icon,
  type = 'svg',
  isNew = false,
}: {
  title: string
  description: string
  downloadUrl: string
  icon: typeof FileText
  type?: string
  isNew?: boolean
}) {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            {isNew && (
              <Badge variant="secondary" className="text-xs">New</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="flex items-center gap-4 mt-4">
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/90"
            >
              <Download className="h-4 w-4" />
              Download {type.toUpperCase()}
            </a>
            <span className="text-xs text-muted-foreground">
              {type.toUpperCase()} Format
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ColorCard({ name, hex, rgb, cmyk }: { name: string; hex: string; rgb: string; cmyk: string }) {
  return (
    <div className="p-6 rounded-lg" style={{ background: hex }}>
      <div className="font-semibold text-white">{name}</div>
      <div className="text-sm text-white/80 space-y-1 mt-2">
        <div>HEX: {hex}</div>
        <div>RGB: {rgb}</div>
        <div>CMYK: {cmyk}</div>
      </div>
    </div>
  )
}

export default function BrandGuidelinesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <MarketingNavbar />
      
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Brand Guidelines
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the Write Care Notes brand. Access our guidelines, 
              download assets, and maintain consistency across all touchpoints.
            </p>
          </div>

          {/* Version Alert */}
          <div className="max-w-5xl mx-auto mb-8">
            <Alert>
              <AlertDescription>
                <span className="font-medium">Latest Update:</span> Version 1.0 - December 2023. 
                Contains updated color palette and new logo variations.
              </AlertDescription>
            </Alert>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="guidelines" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full grid-cols-8 lg:w-[800px]">
                  <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                  <TabsTrigger value="logos">Logos</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="icons">Icons</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="guidelines" className="space-y-8">
                {/* PDF Viewer */}
                <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl font-semibold">Brand Guidelines PDF</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our comprehensive brand guidelines document
                      </p>
                    </div>
                    <a
                      href="/assets/brand/guidelines/write-care-notes-brand-guidelines-v1.pdf"
                      download
                      className="shrink-0"
                    >
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  </div>
                  <div className="aspect-[1/1.4] w-full bg-gray-50 rounded-lg overflow-hidden">
                    <iframe
                      src="/assets/brand/guidelines/write-care-notes-brand-guidelines-v1.pdf"
                      className="w-full h-full border-0"
                      title="Write Care Notes Brand Guidelines"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logos" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold mb-2">Logo Assets</h2>
                  <p className="text-muted-foreground">Download our logo in various formats for different use cases</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
                  <AssetDownloadCard
                    title="Primary Logo (Light)"
                    description="Our main logo for use on light backgrounds"
                    downloadUrl={brandAssets.logos.primary.horizontal.light}
                    icon={FileText}
                    isNew={true}
                  />
                  <AssetDownloadCard
                    title="Primary Logo (Dark)"
                    description="Our main logo for use on dark backgrounds"
                    downloadUrl={brandAssets.logos.primary.horizontal.dark}
                    icon={FileText}
                  />
                  <AssetDownloadCard
                    title="Icon Logo (Light)"
                    description="Our icon logo for use on light backgrounds"
                    downloadUrl={brandAssets.logos.primary.icon.light}
                    icon={FileText}
                  />
                  <AssetDownloadCard
                    title="Icon Logo (Dark)"
                    description="Our icon logo for use on dark backgrounds"
                    downloadUrl={brandAssets.logos.primary.icon.dark}
                    icon={FileText}
                  />
                  <AssetDownloadCard
                    title="Animated Logo"
                    description="Animated version of our logo for digital use"
                    downloadUrl="/assets/brand/logos/animated/logo-animated.svg"
                    icon={ImageIcon}
                    type="svg"
                    isNew={true}
                  />
                  <AssetDownloadCard
                    title="Logo Pattern"
                    description="Repeatable pattern using our logo elements"
                    downloadUrl={brandAssets.images.patterns.light}
                    icon={ImageIcon}
                    type="svg"
                  />
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6">
                <div className="grid gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Color Palette</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Our brand colors are carefully chosen to reflect our professional and caring nature
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
                      <ColorCard
                        name="Primary"
                        hex="#34B5B5"
                        rgb="52, 181, 181"
                        cmyk="71, 0, 32, 0"
                      />
                      <ColorCard
                        name="Secondary"
                        hex="#1E293B"
                        rgb="30, 41, 59"
                        cmyk="85, 69, 51, 46"
                      />
                      <ColorCard
                        name="Accent"
                        hex="#0EA5E9"
                        rgb="14, 165, 233"
                        cmyk="76, 23, 0, 0"
                      />
                      <ColorCard
                        name="Neutral"
                        hex="#64748B"
                        rgb="100, 116, 139"
                        cmyk="64, 47, 37, 9"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="typography" className="space-y-6">
                <div className="grid gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Typography</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Our typefaces are selected for optimal readability and professional appearance
                    </p>
                    <div className="space-y-8 max-w-2xl mx-auto">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Primary Font - Inter</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Headline</div>
                            <div className="text-4xl font-bold">Write Care Notes</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Subheadline</div>
                            <div className="text-2xl">Professional Care Documentation</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Body Copy</div>
                            <div className="text-base">
                              The quick brown fox jumps over the lazy dog. 
                              1234567890
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-primary">Font Weights</h3>
                        <div className="space-y-2">
                          <div className="font-light">Light (300) - Secondary text</div>
                          <div className="font-normal">Regular (400) - Body copy</div>
                          <div className="font-medium">Medium (500) - Important text</div>
                          <div className="font-semibold">Semibold (600) - Subheadings</div>
                          <div className="font-bold">Bold (700) - Headlines</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-6">
                <div className="grid gap-6 max-w-4xl mx-auto">
                  {/* Do's and Don'ts */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Logo Usage Guidelines</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Follow these guidelines to maintain brand consistency
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Do's */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                          <Check className="h-5 w-5" /> Do's
                        </h3>
                        <ul className="space-y-3">
                          {["Maintain minimum clear space", "Use approved color variations", "Keep proportions consistent", "Use high-quality files"].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 mt-1" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Don'ts */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                          <X className="h-5 w-5" /> Don'ts
                        </h3>
                        <ul className="space-y-3">
                          {["Stretch or distort", "Change colors", "Add effects", "Use on busy backgrounds"].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-600 mt-1" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Brand Voice */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Brand Voice</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Our tone and writing style guide
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-primary mb-2">Our Voice Is</h3>
                          <ul className="space-y-3">
                            {["Professional", "Empathetic", "Clear", "Trustworthy"].map((trait) => (
                              <li key={trait} className="flex items-center gap-2">
                                <Circle className="h-2 w-2 text-primary" />
                                <span>{trait}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Writing Tips</h3>
                        <ul className="space-y-3">
                          {[
                            "Use active voice",
                            "Be concise and clear",
                            "Focus on benefits",
                            "Maintain consistency"
                          ].map((tip) => (
                            <li key={tip} className="flex items-center gap-2">
                              <Circle className="h-2 w-2 text-primary" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Accessibility */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Accessibility Guidelines</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Making our brand accessible to everyone
                    </p>
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="grid gap-4">
                        {[
                          {
                            title: "Color Contrast",
                            description: "Maintain WCAG 2.1 AA standard contrast ratios"
                          },
                          {
                            title: "Text Sizing",
                            description: "Minimum 16px for body text, scalable for all devices"
                          },
                          {
                            title: "Alt Text",
                            description: "Provide descriptive alt text for all images"
                          },
                          {
                            title: "Focus States",
                            description: "Clear visual indicators for interactive elements"
                          }
                        ].map((item) => (
                          <div key={item.title} className="p-4 border rounded-lg">
                            <h4 className="font-semibold text-primary">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                <div className="grid gap-6 max-w-4xl mx-auto">
                  {/* Social Media Templates */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Social Media Templates</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Ready-to-use templates for various social platforms
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          platform: "LinkedIn",
                          sizes: ["1200x627px Post", "1200x1200px Image", "300x300px Logo"],
                          icon: Linkedin
                        },
                        {
                          platform: "Twitter",
                          sizes: ["1600x900px Post", "800x800px Image", "400x400px Profile"],
                          icon: Twitter
                        }
                      ].map((platform) => (
                        <div key={platform.platform} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <platform.icon className="h-5 w-5" />
                            <h3 className="font-semibold">{platform.platform}</h3>
                          </div>
                          <ul className="space-y-2">
                            {platform.sizes.map((size) => (
                              <li key={size} className="text-sm flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                <span>{size}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Presentation Templates */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Presentation Templates</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Professional templates for various use cases
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          type: "Sales Deck",
                          format: "PowerPoint",
                          icon: FileText
                        },
                        {
                          type: "Pitch Deck",
                          format: "PowerPoint",
                          icon: FileText
                        }
                      ].map((template) => (
                        <div key={template.type} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <template.icon className="h-5 w-5" />
                            <h3 className="font-semibold">{template.type}</h3>
                          </div>
                          <Button className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Download {template.format}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="icons" className="space-y-6">
                <div className="grid gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Icon Library</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Our custom icon set for consistent visual communication
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {[
                        "Home",
                        "Search",
                        "Settings",
                        "User",
                        "Calendar",
                        "Document",
                        "Chart",
                        "Mail",
                        "Phone",
                        "Lock",
                        "Bell",
                        "Heart"
                      ].map((icon) => (
                        <div key={icon} className="p-4 border rounded-lg text-center">
                          <div className="aspect-square flex items-center justify-center mb-2">
                            <FileText className="h-6 w-6" />
                          </div>
                          <span className="text-sm">{icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="space-y-6">
                <div className="grid gap-6 max-w-4xl mx-auto">
                  {/* Email Signature Generator */}
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-2 text-center">Email Signature Generator</h2>
                    <p className="text-center text-muted-foreground mb-8">
                      Create your branded email signature
                    </p>
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input id="title" placeholder="Senior Developer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input id="email" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input id="phone" placeholder="+1 (555) 123-4567" />
                      </div>
                      <Button className="w-full">
                        Generate Signature
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  )
}
