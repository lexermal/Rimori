import { parseString } from 'xml2js';

class MarkdownExtractor {

  public async getMarkdown(xml:string,uploadFolder:string): Promise<string[]> {

   const xmlObject = await this.convertToObj(xml);

   return this.toArray(xmlObject.pdf2xml.page).map((page:any,index:number) => {
      console.log('Page:', index+1);

      // Create a map to store the resulting markdown based on the order of the elements found in the xml as "top" attribute
      const resultingMarkdown=new Map<number, string>();

      // Extract text data from the page, and store it in the resultingMarkdown map
      this.toArray(page.text).forEach((textElement:any) => {
        const top = parseInt(textElement.$.top);
        const textData = this.extractTextData(textElement);
        const contentonSameLine = resultingMarkdown.get(top) || '';
        resultingMarkdown.set(top, contentonSameLine+" "+textData);
      });

      // Extract image data from the page, and store it in the resultingMarkdown map
      this.toArray(page.image).forEach((imageElement:any) => {
        const top = parseInt(imageElement.$.top);
        const imageData = this.extractImageData(imageElement,uploadFolder);
        const contentonSameLine = resultingMarkdown.get(top) || '';
        resultingMarkdown.set(top, contentonSameLine+" "+imageData);
      });

      // Sort the resultingMarkdown map based on the "top" attribute
      const sortedMarkdown = new Map([...resultingMarkdown.entries()].sort((a, b) => a[0] - b[0]));

      // console.log('resultingMarkdown:', sortedMarkdown);

      return Array.from(sortedMarkdown.values()).join('\n\n');
    });
  }

  private extractTextData(textElement:any): string {
    // Extract text data from the text element and convert it to markdown

    // console.log('Text element:', textElement);

    const headingAttribute=parseInt(textElement.$.height);
    const heading=headingAttribute?this.fontSizeToMarkdownHeading(headingAttribute):"";

    if (textElement.b) {
      return `${heading}**${textElement.b[0]}**`;
    }

    if (textElement.i) {
      return `${heading}*${textElement.i[0]}*`;
    }

    if (textElement.a) {
      // console.log('Text element with link:', textElement.a);
      return `${heading}[${this.extractTextData(textElement.a[0])}](${textElement.a[0].$.href})`;
    }

    if (textElement.u) {
      return `<u>${textElement._}</u>`;
    }

    if(!textElement._){
      console.error('Unknown text element:', textElement);
      return '';
    }

    return heading+textElement._;

  }

private extractImageData(imageElement:any,uploadFolder:string): string {
  // console.log('Image element:', imageElement);
    // Extract image data from the image element and convert it to markdown
    return `![Image](${uploadFolder}/${imageElement.$.src})`;
  }

  private toArray(obj:any): any[] {
    if (!obj) return [];

    return Array.isArray(obj) ? obj : [obj];
  }

  private fontSizeToMarkdownHeading(fontSize:number): string {
      if (fontSize >= 40) return '# ';
      else if (fontSize >= 30) return '## ';
      else if (fontSize >= 25) return '### ';
      else if (fontSize >= 20) return '#### ';
      else return "";
  }

  private convertToObj(xml:string): Promise<any> {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

export default MarkdownExtractor;

const exampleXML = `
<pdf2xml producer="poppler" version="22.02.0">
<page number="1" position="absolute" top="0" left="0" height="1263" width="894">
	<fontspec id="0" size="40" family="AAAAAA+TimesLTPro" color="#000000"/>
	<fontspec id="1" size="29" family="BAAAAA+TimesLTPro" color="#000000"/>
	<fontspec id="2" size="59" family="BAAAAA+TimesLTPro" color="#980000"/>
	<fontspec id="3" size="16" family="CAAAAA+Arial" color="#000000"/>
	<fontspec id="4" size="16" family="DAAAAA+ArialMT" color="#000000"/>
<image top="405" left="204" width="486" height="317" src="input-1_1.png"/>
<image top="58" left="92" width="276" height="107" src="input-1_2.png"/>
<text top="248" left="291" width="337" height="41" font="0"><b>Summary of course</b></text>
<text top="319" left="188" width="544" height="30" font="1">The Entrepreneurial Process and Opportunity</text>
<text top="355" left="400" width="147" height="30" font="1">Recognition</text>
<text top="759" left="371" width="178" height="60" font="2">30 Aug</text>
<text top="864" left="135" width="60" height="18" font="3"><a href="input.html#2"><b>Lecture</b></a></text>
<text top="864" left="776" width="9" height="18" font="3"><a href="input.html#2"><b>2</b></a></text>
<text top="888" left="135" width="368" height="18" font="4"><a href="input.html#2">1. Entrepreneurial decision-making (case seminar)</a></text>
<text top="888" left="776" width="9" height="18" font="4"><a href="input.html#2">2</a></text>
<text top="911" left="135" width="194" height="18" font="4"><a href="input.html#3">2. Entrepreneurial learning</a></text>
<text top="911" left="776" width="9" height="18" font="4"><a href="input.html#3">3</a></text>
<text top="935" left="135" width="54" height="18" font="3"><a href="input.html#7"><b>Videos</b></a></text>
<text top="935" left="776" width="9" height="18" font="3"><a href="input.html#7"><b>7</b></a></text>
<text top="958" left="135" width="60" height="18" font="3"><a href="input.html#9"><b>Articles</b></a></text>
<text top="958" left="776" width="9" height="18" font="3"><a href="input.html#9"><b>8</b></a></text>
</page>
<page number="2" position="absolute" top="0" left="0" height="1263" width="894">
	<fontspec id="5" size="39" family="AAAAAA+TimesLTPro" color="#000000"/>
	<fontspec id="6" size="14" family="BAAAAA+TimesLTPro" color="#000000"/>
	<fontspec id="7" size="27" family="AAAAAA+TimesLTPro" color="#980000"/>
	<fontspec id="8" size="14" family="EAAAAA+TimesLTPro" color="#000000"/>
	<fontspec id="9" size="14" family="AAAAAA+TimesLTPro" color="#980000"/>
	<fontspec id="10" size="15" family="FAAAAA+Roboto" color="#444645"/>
<image top="721" left="137" width="406" height="209" src="input-2_1.png"/>
<image top="250" left="513" width="249" height="175" src="input-2_2.png"/>
<image top="463" left="108" width="280" height="198" src="input-2_3.png"/>
<image top="462" left="426" width="260" height="186" src="input-2_4.png"/>
<text top="127" left="395" width="129" height="39" font="5"><b>Lecture</b></text>
<text top="169" left="385" width="150" height="15" font="6">____________________</text>
<text top="207" left="196" width="555" height="27" font="7"><b>Entrepreneurial decision-making (case seminar)</b></text>
<text top="235" left="135" width="364" height="13" font="8"><i>“Entrepreneurial decision-making is about understanding</i></text>
<text top="249" left="162" width="337" height="13" font="8"><i>how and why individuals make decisions pertaining to</i></text>
<text top="263" left="162" width="337" height="13" font="8"><i>entrepreneurial action. Much of the current work has</i></text>
<text top="277" left="162" width="337" height="13" font="8"><i>been conducted from an entrepreneurial cognition</i></text>
<text top="291" left="162" width="337" height="13" font="8"><i>approach aiming to uncover how entrepreneurs think</i></text>
<text top="305" left="162" width="337" height="13" font="8"><i>and act upon certain logic. Entrepreneurial cognition</i></text>
<text top="319" left="162" width="337" height="13" font="8"><i>can be understood as &#34;the knowledge structures&#34;</i></text>
<text top="333" left="162" width="337" height="13" font="8"><i>entrepreneurs use to make assessments, judgments or</i></text>
<text top="347" left="162" width="337" height="13" font="8"><i>decisions under uncertainty. At this seminar, we will</i></text>
<text top="361" left="162" width="337" height="13" font="8"><i>discuss entrepreneurial decision-making based on the</i></text>
<text top="375" left="162" width="336" height="13" font="8"><i>case &#34;Using Eﬀectuation to start up a new venture</i></text>
<text top="389" left="162" width="124" height="13" font="8"><i>through Instagram”.</i></text>
<text top="423" left="135" width="154" height="15" font="9"><b>Sara Sarasvathy (2001):</b></text>
<text top="441" left="135" width="237" height="15" font="6">Managerial vs. entrepreneurial thinking</text>
<text top="704" left="135" width="160" height="15" font="6">Causation VS Eﬀectuation</text>
<text top="958" left="135" width="151" height="15" font="6">Principles of eﬀectuation</text>
<text top="954" left="289" width="150" height="18" font="10">Sarasvathy, S.D. 2022</text>
<text top="976" left="135" width="5" height="15" font="6">-</text>
<text top="976" left="162" width="75" height="13" font="8"><i>Bird in hand</i></text>
<text top="976" left="241" width="263" height="15" font="6">- imagine possibilities, leverage your means</text>
<text top="994" left="135" width="5" height="15" font="6">-</text>
<text top="994" left="162" width="90" height="13" font="8"><i>Aﬀordable loss</i></text>
<text top="994" left="256" width="147" height="15" font="6">- focus on downside risk</text>
<text top="1012" left="135" width="5" height="15" font="6">-</text>
<text top="1012" left="162" width="62" height="13" font="8"><i>Lemonade</i></text>
<text top="1012" left="228" width="406" height="15" font="6">– leverage contingencies/ opportunities arising from the unexpected</text>
<text top="1030" left="135" width="5" height="15" font="6">-</text>
<text top="1030" left="162" width="67" height="13" font="8"><i>Crazy quilt</i></text>
<text top="1030" left="233" width="345" height="15" font="6">- form self-selected partnerships to co-create the outcome</text>
<text top="1048" left="135" width="5" height="15" font="6">-</text>
<text top="1048" left="162" width="104" height="13" font="8"><i>Pilot in the plane</i></text>
<text top="1048" left="269" width="503" height="15" font="6">- control rather than predict the future, focus on actions where you can inﬂuence the</text>
<text top="1066" left="162" width="52" height="15" font="6">outcome</text>
</page>
</pdf2xml>
`;