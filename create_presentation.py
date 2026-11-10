from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

OUT = "/home/abhyansh/Documents/deep learning project/Water_Quality_Early_Warning_Project_Presentation.pptx"
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

NAVY = RGBColor(10, 31, 50)
PANEL = RGBColor(18, 49, 69)
TEAL = RGBColor(50, 210, 190)
CYAN = RGBColor(100, 206, 235)
WHITE = RGBColor(240, 247, 250)
MUTED = RGBColor(172, 196, 207)
GOLD = RGBColor(255, 194, 92)
FONT = "Aptos"

def shape(slide, kind, x, y, w, h, fill, line=None, radius=False):
    s = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    s.fill.solid(); s.fill.fore_color.rgb = fill
    s.line.color.rgb = line or fill
    return s

def textbox(slide, x, y, w, h, text, size=18, color=WHITE, bold=False,
            font=FONT, align=PP_ALIGN.LEFT, valign=MSO_ANCHOR.TOP, margin=0.05):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.clear(); tf.word_wrap = True
    tf.margin_left = Inches(margin); tf.margin_right = Inches(margin)
    tf.margin_top = Inches(margin); tf.margin_bottom = Inches(margin)
    tf.vertical_anchor = valign
    p = tf.paragraphs[0]; p.alignment = align
    r = p.add_run(); r.text = text
    r.font.name = font; r.font.size = Pt(size); r.font.bold = bold; r.font.color.rgb = color
    return box

def base(title, kicker=None):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    slide.background.fill.solid(); slide.background.fill.fore_color.rgb = NAVY
    shape(slide, MSO_SHAPE.RECTANGLE, 0, 0, 0.12, 7.5, TEAL)
    if kicker: textbox(slide, 0.65, 0.34, 5.4, 0.3, kicker.upper(), 10, TEAL, True)
    textbox(slide, 0.65, 0.7, 12, 0.58, title, 28, WHITE, True)
    shape(slide, MSO_SHAPE.RECTANGLE, 0.65, 1.42, 12.0, 0.018, PANEL)
    n = len(prs.slides)
    textbox(slide, 11.95, 7.08, 0.7, 0.22, f"{n:02d}", 10, MUTED, True, align=PP_ALIGN.RIGHT)
    textbox(slide, 0.65, 7.08, 9.8, 0.22, "21CSC406J  •  CASE STUDY REPORT", 9, MUTED)
    return slide

def bullet_list(slide, x, y, w, h, items, size=17, gap=10, color=WHITE, accent=TEAL):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.clear(); tf.word_wrap = True
    tf.margin_left = Inches(0.03); tf.margin_right = Inches(0.03)
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = "•  " + item
        p.font.name = FONT; p.font.size = Pt(size); p.font.color.rgb = color
        p.space_after = Pt(gap)
    return box

# 1 — title
s = prs.slides.add_slide(prs.slide_layouts[6]); s.background.fill.solid(); s.background.fill.fore_color.rgb = NAVY
shape(s, MSO_SHAPE.RECTANGLE, 0, 0, 0.14, 7.5, TEAL)
shape(s, MSO_SHAPE.OVAL, 9.1, 0.7, 3.6, 3.6, PANEL)
shape(s, MSO_SHAPE.OVAL, 9.65, 1.24, 2.55, 2.55, NAVY)
shape(s, MSO_SHAPE.OVAL, 10.15, 1.75, 1.55, 1.55, TEAL)
for x,y,w in [(8.45,4.1,3.8),(9.0,4.55,3.3),(8.2,5.0,4.2)]:
    shape(s, MSO_SHAPE.RECTANGLE, x, y, w, 0.035, CYAN)
textbox(s, 0.82, 0.82, 5.5, 0.35, "21CSC406J • CASE STUDY PRESENTATION", 12, TEAL, True)
textbox(s, 0.82, 1.75, 7.5, 2.2, "Water quality\ndeterioration prediction", 36, WHITE, True)
textbox(s, 0.85, 4.18, 6.8, 0.95, "A TabTransformer framework using CPCB/NWMP data and spatio-temporal features", 20, MUTED)
textbox(s, 0.85, 6.55, 6.9, 0.35, "Case study  |  November 2026", 12, MUTED)
textbox(s, 9.15, 6.5, 3.2, 0.35, "SENSE  →  FORECAST  →  ACT", 11, TEAL, True, align=PP_ALIGN.RIGHT)

# 2 problem
s = base("Problem statement", "01 / Motivation")
textbox(s, .8, 1.8, 5.3, .55, "Monitoring tells us what is happening now.", 22, WHITE, True)
textbox(s, .8, 2.42, 5.2, 1.2, "Operators need enough warning to act before a threshold is breached.", 18, MUTED)
shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 6.65, 1.9, 5.7, 3.75, PANEL)
textbox(s, 7.0, 2.2, 4.9, .45, "THE CORE CHALLENGE", 12, TEAL, True)
bullet_list(s, 7.0, 2.8, 4.9, 2.5, ["Sensor streams are noisy, incomplete and non-stationary", "Water parameters interact across time", "Threshold alerts trigger only after deterioration"], 16, 14)
shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, .8, 4.25, 5.25, 1.38, RGBColor(13, 58, 72))
textbox(s, 1.08, 4.52, 4.65, .85, "Research question\nCan a deep learning model classify water quality while accounting for severe class imbalance?", 16, WHITE, True)

# 3 survey
s = base("Literature survey", "02 / What prior work shows")
cards = [
    ("CNN–LSTM hybrids", "Capture local sensor patterns and longer temporal dependencies.\nBarzegar et al. (2020); Abdul Haq & Harigovindan (2022)", TEAL),
    ("Attention + recurrent models", "Improve focus on influential time steps; some studies use Bi-LSTM.\nChen et al. (2022); Zhang et al. (2022)", CYAN),
    ("Early-warning systems", "Demonstrate operational value of forecasting threshold events.\nZhang, Fitch & Thorburn (2020)", GOLD),
    ("Missing-data methods", "Transfer learning and GRU-D offer approaches to incomplete sequences.\nChen et al. (2021); Che et al. (2018)", TEAL),
]
for i,(head,body,accent) in enumerate(cards):
    x=.8+(i%2)*6.0; y=1.78+(i//2)*2.22
    shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, x,y,5.6,1.82,PANEL)
    shape(s, MSO_SHAPE.RECTANGLE, x,y,.08,1.82,accent)
    textbox(s,x+.3,y+.22,5.0,.35,head,18,WHITE,True)
    textbox(s,x+.3,y+.7,5.0,.9,body,13,MUTED)
textbox(s,.82,6.38,11.4,.35,"Review scope: 22 peer-reviewed studies (2018–2026), compared across model, data, validation and operational use.",12,TEAL,True)

# 4 limitations
s = base("Limitations identified in the literature", "03 / Research gap")
rows = [
    ("Forecast scope", "Most studies predict one step or a single variable; lead time for action is limited."),
    ("Data quality", "Missing readings and sensor gaps are often removed or imputed outside the model."),
    ("Streaming realism", "Bidirectional models and random splits can introduce future-information leakage."),
    ("Decision support", "Forecasts are rarely converted into graded, standards-linked alerts."),
    ("Trust", "Uncertainty and explanations for both influential times and parameters are limited."),
]
for i,(a,b) in enumerate(rows):
    y=1.78+i*.91
    shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, .82,y,11.7,.72,PANEL)
    textbox(s,1.08,y+.13,2.15,.35,a,15,TEAL,True)
    textbox(s,3.25,y+.12,8.9,.42,b,14,WHITE)
textbox(s,.85,6.48,11.2,.3,"Opportunity: combine causal multi-horizon forecasting, native missingness handling and actionable risk scoring.",13,GOLD,True)

# 5 objectives
s = base("Project objectives", "04 / Intended outcomes")
objs = [
    ("01", "Classify", "Assign samples to Safe, Marginal and Unsafe BIS-based categories."),
    ("02", "Use context", "Include station-level and engineered temporal WQI features."),
    ("03", "Explain", "Use SHAP to identify influential water-quality features."),
    ("04", "Evaluate", "Compare TabTransformer with tree, MLP and FT-Transformer baselines."),
]
for i,(num,head,body) in enumerate(objs):
    x=.82+(i%2)*6.0; y=1.9+(i//2)*2.12
    textbox(s,x,y,.8,.58,num,25,TEAL,True)
    textbox(s,x+.85,y,4.6,.4,head,19,WHITE,True)
    textbox(s,x+.85,y+.52,4.55,.95,body,15,MUTED)

# 6 methodology
s = base("Implemented model / methodology", "05 / End-to-end pipeline")
steps = [
    ("01", "CPCB / NWMP", "2019–2023"), ("02", "Preprocess", "17 features"),
    ("03", "TabTransformer", "Feature attention"), ("04", "Compare", "ML baselines"),
    ("05", "Explain", "SHAP"), ("06", "Decision support", "Risk + actions"),
]
for i,(n,h,b) in enumerate(steps):
    x=.72+i*2.08
    shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,x,2.35,1.78,1.75,PANEL)
    textbox(s,x+.13,2.52,1.5,.3,n,13,TEAL,True,align=PP_ALIGN.CENTER)
    textbox(s,x+.1,2.97,1.58,.55,h,15,WHITE,True,align=PP_ALIGN.CENTER)
    textbox(s,x+.1,3.58,1.58,.36,b,10,MUTED,align=PP_ALIGN.CENTER)
    if i<5: textbox(s,x+1.8,3.0,.28,.35,"→",18,TEAL,True,align=PP_ALIGN.CENTER)
shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,.85,4.65,11.6,1.05,RGBColor(13,58,72))
textbox(s,1.12,4.88,11.05,.62,"Use the notebook's time-aware split  •  compare XGBoost, Random Forest, MLP and FT-Transformer baselines",15,WHITE,True,align=PP_ALIGN.CENTER)
textbox(s,.88,6.18,11.4,.42,"Classification uses engineered station and temporal WQI features; forecasts are separate dashboard outputs.",13,MUTED,align=PP_ALIGN.CENTER)

# 7 dataset
s = base("Dataset details", "06 / Project data")
shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,.82,1.82,4.0,3.95,PANEL)
textbox(s,1.15,2.12,3.3,.4,"PRIMARY SOURCE",12,TEAL,True)
textbox(s,1.15,2.65,3.25,.8,"CPCB / NWMP\nwater-quality records",23,WHITE,True)
textbox(s,1.15,3.75,3.2,1.45,"2019–2023 data\n1,990 labeled samples\n17 model features",15,MUTED)
textbox(s,5.25,1.95,6.7,.42,"TARGET SENSOR VARIABLES",12,TEAL,True)
params=[("DO","Dissolved oxygen"),("pH","Acidity / alkalinity"),("TURB","Turbidity"),("SC","Specific conductance"),("TEMP","Water temperature"),("NO₃","Nitrate (where available)")]
for i,(tag,label) in enumerate(params):
    x=5.2+(i%2)*3.35; y=2.55+(i//2)*.9
    shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,x,y,3.05,.68,RGBColor(21,61,77))
    textbox(s,x+.12,y+.17,.7,.28,tag,12,TEAL,True)
    textbox(s,x+.88,y+.15,2.0,.34,label,12,WHITE)
shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,5.2,5.42,6.42,.75,PANEL)
textbox(s,5.42,5.58,5.98,.42,"Time-aware split: 1,500 train / 490 test samples",13,GOLD,True)
textbox(s,.87,6.22,11.4,.45,"Features: physicochemical parameters plus engineered station and temporal WQI features",13,MUTED)

# 8 metrics
s = base("Classification results", "07 / Recorded held-out comparison")
shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,.82,1.88,5.7,3.93,PANEL)
textbox(s,1.15,2.15,4.9,.4,"TABTRANSFORMER",13,TEAL,True)
bullet_list(s,1.15,2.75,4.9,2.4,["Accuracy: 99.18%", "Macro F1: 88.27%", "Macro precision: 99.07%", "Macro recall: 83.05%"],16,12)
shape(s,MSO_SHAPE.ROUNDED_RECTANGLE,6.78,1.88,5.7,3.93,PANEL)
textbox(s,7.12,2.15,4.9,.4,"TEST SET CONTEXT",13,CYAN,True)
bullet_list(s,7.12,2.75,4.9,2.4,["490 held-out samples", "2 Safe labels", "139 Marginal labels", "349 Unsafe labels"],16,12)
textbox(s,.95,6.2,11.2,.42,"Macro F1: TabTransformer 88.27% vs. XGBoost / Random Forest 66.26%.",14,GOLD,True,align=PP_ALIGN.CENTER)

# 9 references
s = base("Selected references", "Sources from the completed research")
refs=[
"Barzegar, R. et al. (2020). Short-term water quality variable prediction using a hybrid CNN–LSTM. DOI: 10.1007/s00477-020-01776-2",
"Chen, H. et al. (2022). Water Quality Prediction Based on LSTM and Attention: Burnett River case study. DOI: 10.3390/su142013231",
"Zhang, Y., Fitch, P. & Thorburn, P. J. (2020). Real-Time Early Warning System for Drinking Water Quality. DOI: 10.3389/fenvs.2020.00067",
"Che, Z. et al. (2018). Recurrent Neural Networks for Multivariate Time Series with Missing Values (GRU-D). DOI: 10.1038/s41598-018-24271-9",
"Central Pollution Control Board (CPCB), National Water Quality Monitoring Programme (NWMP) data, 2019–2023.",
"Project research documents: Literature Review & Research Gap Analysis; Proposed Project Implementation & Research Contribution.",
]
bullet_list(s,.95,1.85,11.55,4.75,refs,14,15)

prs.save(OUT)
print(OUT)
