// neutralino api wrapper that mimics electronapi
console.log('Loading API wrapper...');

class NeutralinoAPI {
  constructor() {
    this.ready = false;
    console.log('neutralinoapi constructor called');
  }

  async waitReady() {
    if (this.ready) return;
    try {
      console.log('initializing neutralino...');
      await Neutralino.init();
      this.ready = true;
      console.log('neutralino initialized successfully');
    } catch (error) {
      console.error('failed to initialize neutralino:', error);
    }
  }

  async getAllJobs() {
    await this.waitReady();
    try {
      const data = await Neutralino.storage.getData('jobs');
      return { success: true, jobs: data ? JSON.parse(data) : [] };
    } catch (error) {
      console.error('error getting jobs:', error);
      // handle case where storage key doesn't exist yet
      if (error.code === 'NE_ST_NOSTKEX') {
        return { success: true, jobs: [] };
      }
      return { success: false, error: error.message };
    }
  }

  async saveJob(rawText, company, title) {
    await this.waitReady();
    try {
      console.log('starting savejob, rawtext:', rawText, 'company:', company, 'title:', title);
      
      // get openrouter api key from storage
      let apiKey = '';
      try {
        const configData = await Neutralino.storage.getData('config');
        if (configData) {
          const config = JSON.parse(configData);
          apiKey = config.openRouterApiKey || '';
        }
      } catch (error) {
        console.log('no config found, using empty api key');
      }
      
      // clean the job description with ai if api key is available
      let cleanedData = {
        company: company || '',
        title: title || '',
        location: '',
        role_id: '',
        cleaned_text: rawText
      };
      
      if (apiKey) {
        console.log('calling openrouter api to clean job description...');
        try {
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.href,
              'X-Title': 'Job Tracker'
            },
            body: JSON.stringify({
              model: 'anthropic/claude-3-haiku',
              messages: [
                {
                  role: 'user',
                  content: `Extract and clean the following job posting. Return ONLY a JSON object with these exact keys:
- company: the company name
- title: the job title
- location: the location (city, state, or remote)
- role_id: the job ID or requisition number if present
- cleaned_text: a clean, well-formatted version of the job description with standardized sections

For cleaned_text, organize the description into these standard sections (use these exact section headers):
- About the Company
- Position Overview
- Responsibilities
- Qualifications
- Additional Information

If a section doesn't have information, omit it. Use consistent formatting with proper spacing between sections.

Job posting:
${rawText}

Return ONLY the JSON, no other text.`
                }
              ],
              max_tokens: 4000,
              temperature: 0.1
            })
          });
          
          const data = await response.json();
          console.log('openrouter response:', data);
          
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const content = data.choices[0].message.content;
            console.log('ai response content:', content);
            
            // parse the json response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const aiResult = JSON.parse(jsonMatch[0]);
              
              // convert cleaned_text object to formatted string if it's an object
              let formattedText = rawText;
              if (aiResult.cleaned_text && typeof aiResult.cleaned_text === 'object') {
                formattedText = Object.entries(aiResult.cleaned_text)
                  .map(([section, content]) => `${section}\n\n${content}`)
                  .join('\n\n');
              } else if (aiResult.cleaned_text) {
                formattedText = aiResult.cleaned_text;
              }
              
              cleanedData = {
                company: aiResult.company || company || '',
                title: aiResult.title || title || '',
                location: aiResult.location || '',
                role_id: aiResult.role_id || '',
                cleaned_text: formattedText
              };
              console.log('cleaned data:', cleanedData);
            }
          }
        } catch (aiError) {
          console.error('ai cleaning failed:', aiError);
          // fall back to using provided values or raw text
        }
      }
      
      let jobsData;
      try {
        jobsData = await Neutralino.storage.getData('jobs');
      } catch (error) {
        if (error.code === 'NE_ST_NOSTKEX') {
          jobsData = null;
        } else {
          throw error;
        }
      }
      console.log('got jobsdata:', jobsData);
      
      const jobs = jobsData ? JSON.parse(jobsData) : [];
      console.log('parsed jobs:', jobs);
      
      // simple uuid generator
      const generateId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const newJob = {
        company: cleanedData.company,
        title: cleanedData.title,
        location: cleanedData.location,
        role_id: cleanedData.role_id,
        raw_text: rawText,
        cleaned_text: cleanedData.cleaned_text,
        id: generateId(),
        saved_date: new Date().toISOString(),
        source: apiKey ? 'openrouter' : 'none'
      };
      
      console.log('created newjob:', newJob);
      
      jobs.push(newJob);
      await Neutralino.storage.setData('jobs', JSON.stringify(jobs));
      console.log('saved jobs to storage');
      
      return { success: true, job: newJob };
    } catch (error) {
      console.error('error saving job:', error);
      console.error('error details:', error.message, error.stack);
      return { success: false, error: error.message };
    }
  }

  async getJob(id) {
    await this.waitReady();
    try {
      const jobsData = await Neutralino.storage.getData('jobs');
      const jobs = jobsData ? JSON.parse(jobsData) : [];
      const job = jobs.find(j => j.id === id);
      return { success: true, job: job || null };
    } catch (error) {
      console.error('error getting job:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteJob(id) {
    await this.waitReady();
    try {
      const jobsData = await Neutralino.storage.getData('jobs');
      const jobs = jobsData ? JSON.parse(jobsData) : [];
      const filteredJobs = jobs.filter(j => j.id !== id);
      await Neutralino.storage.setData('jobs', JSON.stringify(filteredJobs));
      return { success: true };
    } catch (error) {
      console.error('error deleting job:', error);
      return { success: false, error: error.message };
    }
  }

  async reprocessJob(id) {
    await this.waitReady();
    try {
      const jobsData = await Neutralino.storage.getData('jobs');
      const jobs = jobsData ? JSON.parse(jobsData) : [];
      const jobIndex = jobs.findIndex(j => j.id === id);
      
      if (jobIndex === -1) {
        return { success: false, error: 'job not found' };
      }
      
      // for now, just return the job as-is (ai processing would need backend)
      const job = jobs[jobIndex];
      return { success: true, job: job };
    } catch (error) {
      console.error('error reprocessing job:', error);
      return { success: false, error: error.message };
    }
  }

  async getConfig() {
    await this.waitReady();
    try {
      const data = await Neutralino.storage.getData('config');
      return { success: true, config: data ? JSON.parse(data) : { openRouterApiKey: '' } };
    } catch (error) {
      console.error('error getting config:', error);
      return { success: true, config: { openRouterApiKey: '' } };
    }
  }

  async saveConfig(config) {
    await this.waitReady();
    try {
      await Neutralino.storage.setData('config', JSON.stringify(config));
      return { success: true };
    } catch (error) {
      console.error('error saving config:', error);
      return { success: false, error: error.message };
    }
  }

  async closeWindow() {
    await this.waitReady();
    try {
      await Neutralino.app.exit();
    } catch (error) {
      console.error('error closing window:', error);
    }
  }

  async minimizeWindow() {
    await this.waitReady();
    try {
      await Neutralino.window.minimize();
    } catch (error) {
      console.error('error minimizing window:', error);
    }
  }

  async maximizeWindow() {
    await this.waitReady();
    try {
      await Neutralino.window.maximize();
    } catch (error) {
      console.error('error maximizing window:', error);
    }
  }
}

// initialize api when neutralino is ready
console.log('creating window.electronapi instance...');
window.electronAPI = new NeutralinoAPI();
console.log('window.electronapi set:', window.electronAPI);
